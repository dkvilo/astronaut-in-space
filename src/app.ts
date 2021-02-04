import {
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	AnimationMixer,
	Group,
	GridHelper,
	Color,
	HemisphereLight,
	DirectionalLight,
	LoadingManager,
} from "three";

import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";

type ent_t = { obj: Group };

let container: HTMLDivElement;
let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;
let composer: EffectComposer;
let mixer: AnimationMixer;

const EntityManager: [ent_t] | [] = [];

// Asset Load manager
const loadingManager: LoadingManager = new LoadingManager(() => {
	const loadingScreen: HTMLDivElement = document.getElementById(
		"loading-screen"
	) as HTMLDivElement;
	loadingScreen.classList.add("fade-out");
	loadingScreen.addEventListener("transitionend", (event: any) => {
		event.target.remove();
	});
});

function loadAnimatedObject(): void {
	const loader: FBXLoader = new FBXLoader();

	const load_a = (fbx: Group) => {
		fbx.scale.setScalar(0.1);

		const animationLoader: FBXLoader = new FBXLoader(loadingManager);
		animationLoader.load(
			"../objects/astronaut/anim/Floating.fbx",
			(anim: any) => {
				mixer = new AnimationMixer(fbx);
				mixer.clipAction(anim.animations[0]).play();
			}
		);

		fbx.scale.set(0.5, 0.5, 0.5);
		fbx.position.set(0, 0, 0);

		(EntityManager as [ent_t]).push({
			obj: fbx,
		});
	};

	loader.load("../objects/astronaut/anim/Astronaut.fbx", load_a);
}

init();
animate();

function init() {
	const { innerWidth, innerHeight } = window;

	container = document.createElement("div");
	document.body.appendChild(container);

	// Create Perspective camera
	camera = new PerspectiveCamera(60, innerWidth / innerHeight, 0.01, 1000);
	// configure camera position
	camera.position.set(0, 0.4, 100);

	// Create New Scene
	scene = new Scene();

	// Set dark background
	scene.background = new Color(0x222222);

	// Add Grind on the scene
	scene.add(new GridHelper(20, 20));

	// Create ambient light
	const ambient: HemisphereLight = new HemisphereLight(
		0xbbbbff,
		0x886666,
		0.75
	);
	ambient.position.set(-0.5, 0.75, -1);
	scene.add(ambient);

	// Create the sun :)
	const light: DirectionalLight = new DirectionalLight(0xffffff, 1.75);
	light.position.set(1, 0.75, 0.5);
	scene.add(light);

	loadAnimatedObject();

	// Render Scene
	renderer = new WebGLRenderer({
		antialias: true,
	});

	// #####################################
	//   Basic Post Processing noting fancy
	// #####################################

	// Create effect composer
	composer = new EffectComposer(renderer);

	// add render pass
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	// configure film effect, adds noise and gray scale like old tv
	const filmPass = new FilmPass(
		0.85, // noise intensity
		0.025, // scan line intensity
		680, // scan line count
		2 // gray scale
	);
	filmPass.renderToScreen = true;
	composer.addPass(filmPass);

	// add camera glitch effect
	const glitchPass = new GlitchPass();
	composer.addPass(glitchPass);

	// listen for window resize,
	// onWindowResize function re-calculates the dims
	window.addEventListener("resize", onWindowResize, false);

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);
}

function render(timeElapsed: number) {
	// constant value
	const time: number = performance.now() / 5000;

	// Rotate the scene
	camera.position.set(
		Math.sin(time) * 5,
		// keep the original Y value
		camera.position.y,
		Math.cos(time) * 5
	);

	// get entities form the list and dump them into the scene
	EntityManager.forEach((entity: ent_t) => {
		scene.add(entity.obj);
	});

	// stare the specific point on world
	camera.lookAt(0, 1.5, 0);

	// Update the animation mixer
	if (mixer) {
		mixer.update(timeElapsed * 0.001);
	}

	renderer.render(scene, camera);
	composer.render();
}

// here, oh boy ... here we are calculating elapsed time, does not look pretty but works just fine
let pervT: number;
function animate() {
	requestAnimationFrame((t: number) => {
		if (pervT === null) {
			pervT = t;
		}
		animate();
		render(t - pervT);
		pervT = t;
	});
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
