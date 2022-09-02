

console.log('initialize',this)

return {
    start : ()=> {
        // console.log("hello start");
        // console.log(this)
    },
    update : (event)=> {
        // accTick += event.deltaTick;
        // import * as THREE from 'three';

        this.entity.rotation.y += engine.THREE.MathUtils.degToRad(45)  * event.deltaTick

        
    }
}