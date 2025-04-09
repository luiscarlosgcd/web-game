// Importamos desde la CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/loaders/OBJLoader.js';

// Creamos una escena
const escena = new THREE.Scene();
escena.background = new THREE.Color(0xFFFFFF);

// Creamos una cámara
const camara = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);

// Renderer
const renderer = new THREE.WebGLRenderer({antialias:false}); // Quitar antialias
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

// Iluminación con ambient light
const luz_ambiente = new THREE.AmbientLight( 0x404040 ); // soft white light
escena.add( luz_ambiente );

// Iluminación con directional light
const luz = new THREE.DirectionalLight(0xFFFFFF, 1);
luz.position.set(5,5,5).normalize();
escena.add(luz); // La agregamos a la escena

// Cubito (Geometría y material)
const geometria = new THREE.BoxGeometry();
const textureLoader = new THREE.TextureLoader();
const textura_jugador = textureLoader.load("resource/tex_1.png");
textura_jugador.minFilter = THREE.NearestFilter;
textura_jugador.magFilter = THREE.NearestFilter;
const material = new THREE.MeshStandardMaterial( {map: textura_jugador/*color: 0xFF0000*/} );
const jugador = new THREE.Mesh(geometria, material);
//escena.add(jugador); // Agregamos el cubito a la escena

// --- JETSKI ---
const objLoader = new OBJLoader();
const texture_jetski = textureLoader.load("resource/tex_jetski.png");
const material_jetski = new THREE.MeshStandardMaterial({map: texture_jetski});
let model_jetski;
model_jetski = objLoader.load("resource/model_jetski.obj", (obj) => {
    model_jetski = obj;
    model_jetski.scale.set(.1, .1, .1);
    model_jetski.position.set(0,0,0);
    model_jetski.traverse((child) => 
    {
        if(child.isMesh){
            child.material = material_jetski;
        }
    });
    escena.add(model_jetski);
});

// --- COCODRILO ---
const texture_cocodrilo = textureLoader.load("resource/tex_cocodrilo.png");
const material_cocodrilo = new THREE.MeshStandardMaterial({map: texture_cocodrilo});
let model_cocodrilo;
model_cocodrilo = objLoader.load("resource/model_cocodrilo.obj", (obj) => {
    model_cocodrilo = obj;
    model_cocodrilo.scale.set(.1, .1, .1);
    model_cocodrilo.position.set(0,0,0);
    model_cocodrilo.traverse((child) => 
    {
        if(child.isMesh){
            child.material = material_cocodrilo;
        }
    });
    escena.add(model_cocodrilo);
});

// Suelo
const geometria_suelo = new THREE.PlaneGeometry(256,256);
const textureLoader_suelo = new THREE.TextureLoader();
const textura_suelo = textureLoader_suelo.load("resource/tex_water.png");
textura_suelo.minFilter = THREE.NearestFilter;
textura_suelo.magFilter = THREE.NearestFilter;
textura_suelo.wrapS = THREE.RepeatWrapping; // Activar repeticion de textura en horizontal
textura_suelo.wrapT = THREE.RepeatWrapping; // Activar repeticion de textura en vertical
textura_suelo.repeat.set(32,32); // Repetir la textura 4 veces
const material_suelo = new THREE.MeshStandardMaterial(
    {
        map: textura_suelo,/*color: 0xAAAAAA*/
        transparent: true,
        opacity: 0.5,
        depthWrite: false
    });
const suelo = new THREE.Mesh(geometria_suelo, material_suelo);
const suelo_abajo = new THREE.Mesh(geometria_suelo, material_suelo);
suelo.rotation.x = -Math.PI / 2; // Rotamos para acostar el suelo/plano
suelo_abajo.rotation.x = -Math.PI / 2;
suelo_abajo.rotation.z = -Math.PI / 2;
suelo_abajo.position.set(0, -5, 0);
escena.add(suelo);
escena.add(suelo_abajo);

// Posición inicial del jugador
jugador.position.set(0,0,0);
const speed = 1/15;
const delay = 16;
const offset = 5;

// Ajustamos la posición de la cámara
camara.position.set(0, 2, 5);

// Teclas del juego
const teclas =
{
    w: false,
    a: false,
    s: false,
    d: false
}

// Checamos que tecla se esta presionando
document.addEventListener('keydown', (event) =>
{
    if(event.key in teclas)
        teclas[event.key] = true;
});

// Checamos que tecla se esta levantando
document.addEventListener('keyup', (event) =>
{
    if(event.key in teclas)
        teclas[event.key] = false;
});

// Cambiar color del fondo
const botoncito = document.getElementById("botoncito");
const botoncito2 = document.getElementById("botoncito2");
const colores = [0xFFFFFF, 0x000000, 0xFF0000, 0x00FF00, 0x0000FF];
let color_actual = 0;

botoncito.addEventListener('click', ()=>
{
    color_actual = (color_actual+1) % colores.length;
    escena.background = new THREE.Color(colores[color_actual]);
});

botoncito2.addEventListener('click', ()=>
{
    color_actual = (color_actual+1) % colores.length;
    jugador.material.color.set(colores[color_actual]);
});


let time = 0;
function Update()
{
    requestAnimationFrame(Update);

    // Mover al jugador
    if(teclas.w) jugador.position.z -=speed;
    if(teclas.s) jugador.position.z +=speed;
    if(teclas.a) jugador.position.x -=speed;
    if(teclas.d) jugador.position.x +=speed;

    // Flotar en el agua
    jugador.position.y += Math.sin(time*3) * 0.003;
    time+=1/60;

    // Rotar con las olas
    jugador.rotation.x += Math.sin(time*3) * 0.003;
    jugador.rotation.z += Math.sin(time*2) * 0.003;
    time+=1/60;

    // jetski y cocodrilo siguen al player
    model_cocodrilo.position.copy(jugador.position);
    model_jetski.position.copy(jugador.position);

    model_cocodrilo.rotation.copy(jugador.rotation);
    model_jetski.rotation.copy(jugador.rotation);
    /*
    model_cocodrilo.position.set(jugador.position.x, jugador.position.y, jugador.position.z);
    model_jetski.position.set(jugador.position.x, jugador.position.y, jugador.position.z);
*/
    // Seguir al jugador
    //camara.lookAt(jugador.position);
    camara.position.x -= (camara.position.x - jugador.position.x)/delay;
    camara.position.z -= (camara.position.z - (jugador.position.z+offset))/delay;

    // animar agua
    material_suelo.map.offset.x += 1/300;
    material_suelo.map.offset.y += 1/300;


    // Renderizamos la escena
    renderer.render(escena,camara);
}

Update();