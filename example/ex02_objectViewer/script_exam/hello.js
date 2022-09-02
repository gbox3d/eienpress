console.log('initialize',this)

let accTick = 0
let count = 0
return {
    start : ()=> {
        console.log("hello start");
        console.log(this)
    },
    update : (event)=> {
        accTick += event.deltaTick;

        // this.entity.transform.rotate(0,0,0.1*event.deltaTick);

        // console.log(accTick)
        
        if(accTick > 1.0){
            console.log("hello update",count++);
            accTick = 0;
        }
    }
}