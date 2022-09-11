console.log('initialize',this)

let accTick = 0
let count = 0
const THREE = engine.THREE
// const engine = this.engine

return {
    start : ()=> {
        console.log("hello start");
        console.log( `THREEEJS version ${THREE.REVISION}` );
    },
    update : (event)=> {
        accTick += event.deltaTick;
        
        if(accTick > 1.0){
            console.log("hello update",count++);
            console.log(engine.camera.position);
            accTick = 0;
        }
    }
}