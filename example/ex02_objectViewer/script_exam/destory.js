console.log('initialize',this)
let accTick = 0;
return {
    start : ()=> {
        console.log("destory start");
        console.log(this)
    },
    update : (event)=> {

        accTick += event.deltaTick;

        console.log(accTick);

        if(accTick > 1){
            this.entity.parent.remove(this.entity);
        }

    }
}