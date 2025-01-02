console.clear();
import { DRACOLoader } from 'https://unpkg.com/three@0.120.0/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader} from 'https://unpkg.com/three@0.120.0/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader} from 'https://unpkg.com/three@0.120.0/examples/jsm/loaders/RGBELoader.js'

const canvas = document.querySelector("canvas"),
loaderProgress = document.querySelector(".loader-progress");

// THREE SCENE
class Donut {
    setup() {
        this.modelsArray = [];
        this.donutGroupPos = [];
        this.donutGroupScale = [];
        this.donutGroupScale2 = [];
        this.assetsHaveLoaded = false;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: canvas,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = Math.pow(1.5, 2.0);
        this.renderer.physicallyCorrectLights = true;
        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.pmremGenerator.compileEquirectangularShader();
        this.camera.position.set(0, 0, 10);
        // loading manageer
        this.loadingManager = new THREE.LoadingManager();
        // hdr env map loader
        this.rgbeLoader = new RGBELoader(this.loadingManager);
        // gltf model loader
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        // loader to handle compressed glb/gltf files
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath("https://threejs.org/examples/jsm/libs/draco/");
        this.dracoLoader.setDecoderConfig( { type: 'js' } );
        // this.dracoLoader.preload()
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
        // mouse event listener
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(), this.INTERSECTED;
    }
    createLight() {
        this.light1 = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(this.light1);
        this.light2 = new THREE.DirectionalLight(0xffffff, 2.5);
        this.scene.add(this.light2);
        this.light2.position.set(10, 0, 1);
    }
    createEnvMap() {
        this.rgbeLoader.load(
            "https://assets.codepen.io/590856/photo_studio_01_1k.hdr",
            (texture) => {
                this.envMap = this.pmremGenerator.fromEquirectangular(
                    texture
                ).texture;
                this.pmremGenerator.dispose();
                this.scene.environment = this.envMap;
            },
            (xhr) => {
                console.log(
                    "loading hdr file:",
                    (xhr.loaded / xhr.total) * 100,
                    "% loaded"
                );
            },
            (error) => {
                console.log("error loading hdr file", error);
            }
        );
    }
    createCircle() {
        this.circleGeo = new THREE.CircleGeometry(3.6, 70.0);
        this.circleGeo.vertices.splice(0, 1);
        this.circle = new THREE.LineLoop(
            this.circleGeo,
            new THREE.LineBasicMaterial()
        )
        this.circle.position.set(0, 0, 0);
        this.circle.scale.set(0,0,0);
        this.circle.material.transparent = true;
        this.circle.material.opacity = 0;
        // clone the circle
        this.circleClone = this.circle.clone();
        this.scene.add(this.circle);
        this.scene.add(this.circleClone);
    }
    createModel() {
        this.gltfLoader.load(
            "https://assets.codepen.io/590856/model.glb",
            (glb) => {
                this.donut = glb.scene.children[0];
                this.icing = this.donut.children[0];
                // sprinkles
                this.sprinkles = this.icing.children[0];
                // flip the donut
                this.donut.rotation.x = THREE.Math.radToDeg(-90);
                this.donut.rotation.y = THREE.Math.radToDeg(-10);
                // tweaking the roughness of toppings
                this.icing.material.roughness = 0.15;
                // donut rotation loop
                this.rotateDonut(this.donut.rotation, "+=0.025");
                // add the model to our scene
                this.scene.add(this.donut);
                // start rendering the scene
                this.animate();
                // scrolltrigger timelines
                scrollTriggerAnims();
            },
            (xhr) => {
                console.log(
                    "loading external model:",
                    (xhr.loaded / xhr.total) * 100,
                    "% loaded"
                );
            },
            (error) => {
                console.log(
                    "An error happened while loading the gltf/glb model(s)",
                    error
                );
            }
        );
    }
    createModelLowQ() {
        this.gltfLoader.load(
            "https://assets.codepen.io/590856/modellq.glb",
            (glb) => {
                this.donutLowQ = glb.scene.children[0];
                this.icingLowQ = this.donutLowQ.children[5];
                // sprinkles
                this.sprinklesLowQ = this.donutLowQ.children[3];
                // sprinkles pattern 2
                this.sprinklesLowQAlt = this.donutLowQ.children[1];
                // peanut particles
                this.peanuts = this.donutLowQ.children[0];
                // streaks
                this.streaks = this.donutLowQ.children[4];
                // sprinkle pattern 3
                this.sprinklesLowQBig = this.donutLowQ.children[2];
                // add donut model to the scene
                this.scene.add(this.donutLowQ);
                // hide parts of the model
                this.peanuts.visible = false;
                this.sprinklesLowQAlt.visible = false;
                this.streaks.visible = false;
                this.sprinklesLowQBig.visible = false;
                // flip the donut
                this.donutLowQ.rotation.x = THREE.Math.radToDeg(-90);
                this.donutLowQ.rotation.y = THREE.Math.radToDeg(-10);
                this.donutLowQ.scale.set(0, 0, 0);
                // tweaking the roughness of toppings
                this.icingLowQ.material.roughness = 0.15;
                this.donutGroupPos.push(this.donutLowQ.position);
                this.donutGroupScale.push(this.donutLowQ.scale);
                // push donut to modelArray
                this.modelsArray.push(this.donutLowQ);
                // create clones of the lq donut model
                this.createClones();
                // material config
                this.icingLowQ.material.roughness = 0.15;
                this.icingLowQ.material.color.set("#f78130");
                this.sprinklesLowQ.visible = false;
                this.sprinklesLowQAlt.visible = true;
                //
                gsap.set(this.donutGroupPos[0], { x: -0.25, y: -2 });
                this.rotateDonut(this.donutLowQ.rotation, "-=0.025");
            },
            (xhr) => {
                console.log(
                    "loading external model:",
                    (xhr.loaded / xhr.total) * 100,
                    "% loaded"
                );
            },
            (error) => {
                console.log(
                    "An error happened while loading the gltf/glb model(s)",
                    error
                );
            }
        );
    } 
    createClones() {
        // pivot point to rotate the group of donuts around
        this.pivot = new THREE.Group();
        this.pivot.position.set(0, 0, 0);
        // group for all cloned donuts
        this.donutLowQGroup = new THREE.Group();
        this.pivot.add(this.donutLowQGroup);
        this.scene.add(this.pivot);
        // create 8 cloned donuts and add them to to the group
        for (let i = 0; i <= 6; i++) {
            this.donutLowQClone = this.donutLowQ.clone();
            // 
            this.modelsArray.push(this.donutLowQClone);
            // clone materials
            this.donutLowQClone.traverse((n) => {
                if (n.isMesh) {
                    // materials need to be cloned if we want to change
                    // each donut's color individually
                    n.material = n.material.clone();
                }
            });
            this.donutGroupPos.push(this.donutLowQClone.position);
            // divide the donuts in 2 groups, so we can animate the 2 groups separately
            i % 2 === 0
                ? this.donutGroupScale.push(this.donutLowQClone.scale)
                : this.donutGroupScale2.push(this.donutLowQClone.scale);
            // add donut to donut group
            this.donutLowQGroup.add(this.donutLowQClone);
            // scale it
            this.donutLowQClone.scale.set(0, 0, 0);
            // icing color config
            this.icingLowQClone = this.donutLowQClone.children[5];
            // sprinkles
            this.sprinklesLowQClone = this.donutLowQClone.children[3];
            // peanuts
            this.peanutsClone = this.donutLowQClone.children[0];
            // sprinkles pattern 2 clone
            this.sprinklesLowQAltClone = this.donutLowQClone.children[1];
            // streaks
            this.streaksClone = this.donutLowQClone.children[4];
            // sprinkles pattern 3 clone
            this.sprinklesLowQBigClone = this.donutLowQClone.children[2];
            // green / yellow donut
            // red icing / purple yellow sprinks
            if (i === 0) {
                this.sprinklesLowQClone.visible = false;
                this.sprinklesLowQAltClone.visible = true;
                this.icingLowQClone.material.color.set("#ff3535");
                this.sprinklesLowQAltClone.children[0].material.color.set("#e0ff00");
                this.sprinklesLowQAltClone.children[1].material.color.set("#6700ff");
            }
            if (i === 1) {
                this.icingLowQClone.material.color.set("#0d4120");
                this.sprinklesLowQClone.children[0].children[0].material.color.set("#e0ff00");
                this.sprinklesLowQClone.children[0].children[1].material.color.set("#e0ff00");
            }
            // caramel donut
            if (i === 2) {
                this.icingLowQClone.material.roughness = 0.1;
                this.icingLowQClone.material.color.set("#ff0e00");
                this.sprinklesLowQClone.visible = false;
            }
            // choc / peanuts
            if (i === 3) {
                this.icingLowQClone.material.color.set("#180200");
                this.icingLowQClone.material.roughness = 0.1;
                this.sprinklesLowQClone.visible = false;
                this.peanutsClone.visible = true;
                this.peanutsClone.children[0].material.color.set("#ffa762");  
            }
            // pink / sprinkles
            if (i === 4) {
                this.icingLowQClone.material.color.set("#b831c1");
                this.sprinklesLowQClone.children[0].children[0].material.color.set("#FFFFFF")
                this.sprinklesLowQClone.children[0].children[1].material.color.set("#05a01a");
            }
            //
            if (i === 5) {
                this.icingLowQClone.material.roughness = 0.15;
                this.icingLowQClone.material.color.set("#FFFFFF");
                this.sprinklesLowQClone.visible = false;
                this.sprinklesLowQBigClone.visible = true;
            }
            // choc with sauce donut
            if (i === 6) {
                this.icingLowQClone.material.roughness = 0.2;
                this.icingLowQClone.material.color.set("#180500");
                this.sprinklesLowQClone.visible = false;
                this.streaksClone.visible = true;
            }
            // donut rotation loop
            this.rotateDonut(this.donutLowQClone.rotation, "-=0.025");
        }
        // rotate the donut clones group around pivot point
        gsap.to(this.donutLowQGroup.rotation, {
            z: "+=0.02",
            repeat: -1,
            yoyo: true,
            yoyoEase: "none",
            duration: 2,
            ease: "none",
        });
        // set position for each donut
        // inner ring
        gsap.set(this.donutGroupPos[1], { x: -2, y: 0.25 });
        gsap.set(this.donutGroupPos[3], { x: 0.25, y: 2 });
        gsap.set(this.donutGroupPos[5], { x: 2, y: -0.25 });

        // outer ring
        gsap.set(this.donutGroupPos[2], { x: -2.55, y: -2.5  });
        gsap.set(this.donutGroupPos[4], { x: -2.55, y: 2.5 });
        gsap.set(this.donutGroupPos[6], { x: 2.55, y: 2.5 });
        gsap.set(this.donutGroupPos[7], { x: 2.55, y: -2.5 });

        // we create the lq model and the lq clones first
        // then we create hq model
        this.createModel();
    }
    loadAssets() {
        this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
            console.log(
                `Started loading file : ${url}, loaded ${itemsLoaded} of ${itemsTotal} `
            );
        };
        this.loadingManager.onLoad = () => {
            this.assetsHaveLoaded = true;
            loaderInTimeline.pause();
            loaderOut();
            pageIn(this.donut.scale);
        };
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log(
                `Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`
            );
            loaderProgress.textContent = `Loading item ${itemsLoaded} / ${itemsTotal}`;
        };
        this.loadingManager.onError = (url) => {
            console.log("There was an error loading " + url);
        };
    }
    rotateDonut(target, rotation) {
        const tl = gsap.timeline({
            defaults: { duration: 0.16, ease: "linear" },
            repeatRefresh: true,
            repeat: -1,
        });
        tl.to(target, { y: rotation });
    }
    tiltDonut() {
        gsap.to(this.donut.rotation, {
            z: -this.mouse.x / 10 + this.mouse.y / 10,
            ease: "power4.out",
        });
      gsap.to(this.donut.position,{
        x: -this.mouse.x / 20 + this.mouse.y / 20,
            ease: "power4.out",
      })
    }
    animateDonutOnMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        if (this.assetsHaveLoaded) {
            this.tiltDonut();
        }
        this.x2 = e.clientX
        this.y2 = e.clientY
    }
    animateDonutOnTouch(e) {
        this.touch = e.targetTouches[0];
        if (this.assetsHaveLoaded && touch) {
            this.mouse.x = this.touch.clientX / window.innerWidth;
            this.mouse.y = this.touch.clientY / window.innerHeight;
            this.tiltDonut();
        }
    }
    showMenuItem(target) {
        let item = document.querySelector(target);
        gsap.set(target, {x: this.x2 + 20, y: this.y2 - 20 });
        gsap.to(target,{autoAlpha:1,duration:0.2,"clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%"})
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects(this.modelsArray);
        if ( this.intersects.length > 0 ) {
            if (this.INTERSECTED != this.intersects[0].object) {
                this.INTERSECTED = this.intersects[0].object;
                if (this.INTERSECTED.uuid === this.modelsArray[0].uuid) {
                    this.showMenuItem('#menu-item-1');
                }
                if (this.INTERSECTED.uuid === this.modelsArray[1].uuid) {
                    this.showMenuItem('#menu-item-2');
                }
                if (this.INTERSECTED.uuid === this.modelsArray[2].uuid) {
                    this.showMenuItem('#menu-item-3');
                }
                if (this.INTERSECTED.uuid === this.modelsArray[3].uuid) {
                    this.showMenuItem('#menu-item-4');
                }    
                if (this.INTERSECTED.uuid === this.modelsArray[4].uuid) {
                    this.showMenuItem('#menu-item-5');
                }    
                if (this.INTERSECTED.uuid === this.modelsArray[5].uuid) {
                    this.showMenuItem('#menu-item-6');
                }                       
                if (this.INTERSECTED.uuid === this.modelsArray[6].uuid) {
                    this.showMenuItem('#menu-item-7');
                }
                if (this.INTERSECTED.uuid === this.modelsArray[7].uuid) {
                    this.showMenuItem("#menu-item-8");
                }
            }
            else {
                this.INTERSECTED = null;
            }
        }  
        else {
            gsap.set(".donut-menu-item", { autoAlpha: 0,"clip-path": "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%"});   
        }
    }
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camZ = (screen.width - this.width * 1) / 30;
        this.camera.position.z = this.camZ < 40 ? 10 : this.camZ / 3.25;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
    }
    init() {
        this.setup();
        this.createLight();
        this.createEnvMap();
        this.loadAssets();
        this.createCircle();
        this.createModelLowQ();
        this.resize();
        console.log(this.renderer.info);
    }
}


// SCROLLTRIGGER ANIMATIONS
gsap.registerPlugin(ScrollTrigger);

gsap.set(".donut-info polyline", { drawSVG: "0% 0%" });
gsap.set(".donut-info path", { drawSVG: "0% 0%" });
gsap.set(".donut-info circle", { autoAlpha: 0 });
gsap.set(".donut-info p", { autoAlpha: 0 });

// scroll indicator timeline
const indicatorTl = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.3,
    paused:true
});

indicatorTl.fromTo(
    ".scroll-indicator span",
    {y:-10},{ y: 90, ease: "power3.inOut", duration: 1 },
    "scroll"
);

const arrowTl = gsap.timeline({
    paused:true,
    repeat: 1,
    repeatDelay: 0.3,
    defaults: { ease: "sine.in",duration:0.4 },
});

arrowTl.to("#l,#r", {
    keyframes: [{ "stroke-dashoffset": "0px" }, { opacity: 0 }],
},0.4);

let indicatorVis = false;

const scrollTriggerAnims = () => {
    const homeTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            trigger: ".home",
            start: "top top",
            end: "+=100%",
            scrub: true,
            onUpdate: (self) => {
                if (
                    self.progress < 0.5 &&
                    self.direction === -1 &&
                    indicatorVis === true
                ) {
                    gsap.to(".scroll-indicator,.scroll-indicator-arrow", {
                        autoAlpha: 0,
                        y: -40,
                    });
                    indicatorTl.pause();
                    arrowTl.pause();
                    indicatorVis = false;
                }
                if (self.progress > 0.32 && self.progress !== 1 && self.direction === 1 && indicatorVis === false) {
                    gsap.fromTo('.scroll-indicator,.scroll-indicator-arrow',{autoAlpha:0,y:-40},{autoAlpha:1,y:0,stagger:0.04});
                    indicatorTl.play();
                    arrowTl.progress() === 1 ? arrowTl.restart() : arrowTl.play();
                    indicatorVis = true;
                }
            },
        },
    });
    const discoverTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            trigger: ".discover",
            start: "top top",
            end: "+=200%",
            scrub: true,
        }
    });
    const menuTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            trigger: ".menu",
            start: "top top",
            end: "+=100%",
            scrub: true
        },
    });
    const shopTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            trigger: ".shop",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate:(self) => {
                if (
                    self.progress < 0.7 &&
                    self.progress !== 1 &&
                    self.direction === -1 &&
                    indicatorVis === false
                ) {
                    gsap.to(".scroll-indicator", { opacity: 1, y: 0 });
                    indicatorTl.play();
                    indicatorVis = true;
                }
                if (self.progress > 0.7 && self.progress !== 1 && self.direction === 1 && indicatorVis === true) {
                    gsap.to(".scroll-indicator", { opacity: 0,y:-40 });
                    indicatorTl.pause();
                    indicatorVis = false;
                }
            }
        },
    });

    homeTl
        .fromTo(".home h1", { y: 0, autoAlpha: 1 }, { autoAlpha: 0, y: -100, scale: 1.2, duration: 0.5 }, 0)
        .fromTo(".home .cta-button", { y: 0, autoAlpha: 1 }, { autoAlpha: 0, y: -100, duration: 0.5 }, 0)
        .to(".social-list", { y: 100, autoAlpha: 0, duration: 0.25 }, 0)
        .to(donutScene.donut.rotation, { x: "-=1.4", duration: 0.3 }, 0)
        .fromTo(donutScene.donut.scale, {x: 55, y: 55, z: 55}, { x: 45, y: 45, z: 45, duration: 0.3 }, 0);

    discoverTl
        // showing donut info
        .set(".discover .container", { autoAlpha: 1 }, 0)
        .to(donutScene.donut.position, { y: -0.68 }, 0)
        .to(donutScene.icing.position, { y: 0.032 }, 0)
        .to(donutScene.sprinkles.position, { y: "+=0.014" }, 0)
        .to(
            ".donut-info polyline",
            { drawSVG: "0% 100%", stagger: 0.1, duration: 0.1 },
            0
        )
        .to(
            ".donut-info path",
            { drawSVG: "0% 100%", stagger: 0.1, duration: 0.1 },
            0.1
        )
        .to(
            ".donut-info p",
            {
                autoAlpha: 1,
                stagger: 0.1,
                duration: 0.1,
                "clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            },
            0.2
        )
        .to(
            ".donut-info circle",
            { autoAlpha: 1, stagger: 0.1, duration: 0.1 },
            0.2
        )

        // removing donut info and preparing donut for next scroll tl
        .to(donutScene.donut.rotation, { x: "+=1.4" }, 0.7)
        .to(donutScene.donut.position, { y: "+=0.68" }, 0.8)
        .to(donutScene.icing.position, { y: "-=0.021" }, 0.8)
        .to(donutScene.sprinkles.position, { y: "-=0.014" }, 0.8)

        .to(
            ".donut-info p",
            {
                autoAlpha: 0,
                stagger: 0.1,
                duration: 0.1,
                "clip-path": "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            },
            1.1
        )
        .to(
            ".donut-info circle",
            { autoAlpha: 0, stagger: 0.1, duration: 0.1 },
            1.1
        )
        .to(
            ".donut-info path",
            { drawSVG: "0% 0%", stagger: 0.1, duration: 0.1 },
            1.2
        )
        .to(
            ".donut-info polyline",
            { drawSVG: "0% 0%", stagger: 0.1, duration: 0.1 },
            1.3
        );
        
    menuTl
        .set(".menu .container", { autoAlpha: 1 }, 0)
        .to(
            ".container-background",
            {
                scaleY: 0,
                transformOrigin: "50% 0%",
                autoAlpha: 0,
                ease: "back.in(0.5)",
            },
            0
        )
        .to(donutScene.donut.scale, { x: 24, y: 24, z: 24 }, 0)
        .to(donutScene.circleClone.material, { opacity: 1 }, 0.3)
        .to(donutScene.circleClone.scale, { x: 0.55, y: 0.55, z: 0.55 }, 0.3)
        .to(donutScene.circle.material, { opacity: 1 }, 0.4)
        .to(donutScene.circle.scale, { x: 1, y: 1, z: 1 }, 0.4)
        .to(
            donutScene.donutGroupScale,
            {
                x: 6,
                y: 6,
                z: 6,
                ease: "back.out(2)",
                stagger: 0.2,
            },
            0.7
        )
        .to(
            donutScene.donutGroupScale2,
            {
                x: 6,
                y: 6,
                z: 6,
                ease: "back.out(2)",
                stagger: 0.2,
            },
            0.9
        );

    shopTl
        .set(".shop .container", { autoAlpha: 1 }, 0)
        // remove donuts
        .to(donutScene.circle.material, { opacity: 0 }, 0.6)
        .to(donutScene.circleClone.material, { opacity: 0 }, 0.8)
        .to(
            donutScene.donutGroupScale2,
            { x: 0, y: 0, z: 0, stagger: 0.2, ease: "back.in(2)" },
            0
        )
        .to(
            donutScene.donutGroupScale,
            { x: 0, y: 0, z: 0, stagger: 0.2, ease: "back.in(2)" },
            0.2
        )
        .to(donutScene.donut.scale, { x: 0, y: 0, z: 0 }, 1.3)
        .fromTo(
            ".shop p, .cta-wrap",
            { y: gsap.utils.wrap([-30, -20]) },
            { y: 0, autoAlpha: 1, stagger: 0.3 },
            1.5
        );
}

// loader / nav
const loaderSprinkles = document.querySelectorAll("#sprinkles line"),
    donutFront = document.querySelector("#donut-front"),
    donutBackInner = document.querySelectorAll("#donut-back-inner"),
    donutBackOuter = document.querySelector("#donut-back-outer");

// Prloader in animation
const loaderIn = () => {
    gsap.set(loaderSprinkles, { drawSVG: "50% 50%" });
    const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.25,
        repeatRefresh: true,
        paused: true,
    });
    tl.to(loaderSprinkles, { drawSVG: "0% 100%", ease: "expo.inOut" }, "in")
        .to(
            donutFront,
            { rotation: "+=90", transformOrigin: "50% 50%", ease: "back.out" },
            "out"
        )
        .to(
            donutBackInner,
            { rotation: "+=90", transformOrigin: "36% 50%", ease: "back.out" },
            "out"
        )
        .to(
            donutBackOuter,
            { rotation: "+=90", transformOrigin: "46% 50%", ease: "back.out" },
            "out"
        )
        .to(loaderSprinkles, { drawSVG: "50% 50%" }, "out");
    return tl;
};
const loaderInTimeline = loaderIn();

// Preloader load complete animation
const loaderOut = () => {
    const tl = gsap.timeline({});
    tl.to(
        ".loader-donut,.loader-progress",
        {
            autoAlpha: 0,
            y: 10,
            scale: 0,
            transformOrigin: "50% 50%",
            stagger: { start: "end", each: "0.1" },
            ease: "back.in",
        },
        "out"
    )
        .to(
            ".loader-curtains span",
            {
                y: gsap.utils.wrap(["-100%", "100%", "-100%", "100%"]),
                stagger: 0.1,
                ease: "power2.inOut",
                duration: 0.6,
            },
            "out+=0.3"
        )
        .set(".loader", { autoAlpha: 0 });
    return tl;
};

// Page in animation
const pageIn = (model) => {
    const tl = gsap.timeline();
    tl.fromTo(
        ".container-background",
        { y: 20 },
        { y: 0, ease: "expo.out" },
        0.6
    )
        .fromTo(
            model,
            { x: 0, y: 0, z: 0 },
            { x: 55, y: 55, z: 55, ease: "back.out(1.3)", duration: 0.8 },
            0.74
        )
        .fromTo(
            ".home h1",
            { autoAlpha: 0, y: 20 },
            { y: 0, autoAlpha: 1 },
            0.88
        )
        .fromTo(
            ".home .cta-button",
            { autoAlpha: 0, y: 20 },
            { y: 0, autoAlpha: 1 },
            1.08
        );
    return tl;
};
// search
const searchContainer = document.querySelector('.search-container');
const searchIcon = document.querySelector(".search-icon");
searchIcon.addEventListener("click", () => {
    document.getElementById("search").classList.toggle("visible");
    searchIcon.classList.toggle("bg-visible");
});

const nav = document.querySelector(".nav-right");
const navList = document.querySelectorAll(".nav-links li");
const burgerBtn = document.querySelector(".nav-toggle-btn");
const shopIcon = document.querySelector(".shopping-bag-icon");
// dropdown
burgerBtn.addEventListener("click", () => {
    nav.dataset.toggled === "false"
        ? (nav.dataset.toggled = true)
        : (nav.dataset.toggled = false);
    burgerBtn.dataset.clicked === "false"
        ? (burgerBtn.dataset.clicked = true)
        : (burgerBtn.dataset.clicked = false);
    if (burgerBtn.dataset.clicked === 'false') {
        nav.classList.add("animate-out");
        searchContainer.classList.add("animate-out-3");
        shopIcon.classList.add('animate-out-3');
    }
    else {
        nav.classList.add("animate-in");
        searchContainer.classList.add("animate-in-3");
        shopIcon.classList.add("animate-in-3");
    }
    if (burgerBtn.dataset.clicked === "false") {
        for (let i = 0; i <= navList.length - 1; i++) {
            navList[i].classList.add("animate-out-2");
        }
    }
    else {
        for (let i = 0; i <= navList.length - 1; i++) {
            navList[i].classList.add("animate-in-2");
        }
    }  
});
// animation classes dropdown
nav.addEventListener("transitionend", () => {
    nav.classList.remove("animate-out");
    nav.classList.remove("animate-in");
});
for (let i = 0; i <= navList.length - 1; i++) {
    navList[i].addEventListener("transitionend", () => {
        navList[i].classList.remove("animate-out-2");
        navList[i].classList.remove("animate-in-2");
    });
}
searchContainer.addEventListener('transitionend',() => {
    searchContainer.classList.remove("animate-out-3");
    searchContainer.classList.remove("animate-in-3");
});
shopIcon.addEventListener('transitionend',() => {
    shopIcon.classList.remove("animate-out-3");
    shopIcon.classList.remove("animate-in-3");
})
// active links while using scrolltrigger
const navLinks = document.querySelectorAll('.nav-links a');

const setActiveNav = (index) => {
    !navLinks[index].classList.contains('active') ? navLinks[index].classList.add('active') : null;
};
const removeActiveNav = (index) => {
    navLinks[index].classList.remove("active");
}
// active links while using navbar links
const main = document.querySelector("main");
let options = {
    root: document , //https://github.com/w3c/IntersectionObserver/issues/283
    rootMargin: `-50% 0% -50%`,
    threshold: 0,
};

const setActive = (entry) => {
    const navLink = document.querySelector(`a[data-ref='${entry.target.id}']`);
    const active = document.querySelector(".active");
    active ? active.classList.remove("active") : null
    navLink ? navLink.classList.add("active") : null;
};

const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            // exit out of fn if not intersecting
            return;
        } else {
            setActive(entry);
        }
    });
}, options);

const mainArray = Array.from(main.children);
mainArray.forEach((el) => {
    sectionObserver.observe(el, sectionObserver);
});
// window.addEventListener("hashchange", () => {
//     history.replaceState(null, null, " ");
// });

window.addEventListener("DOMContentLoaded", () => {
    loaderInTimeline.play();
});
window.addEventListener("resize", () => {
    donutScene.resize();
});
window.addEventListener('mousemove',(e) => {
    donutScene.animateDonutOnMove(e);
});
window.addEventListener('touchmove',(e) => {
    donutScene.animateDonutOnTouch(e);
})

const donutScene = new Donut();

donutScene.init();