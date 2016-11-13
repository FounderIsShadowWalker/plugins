 /* *
     * * dragBox：拖动对象，可以是对象的ID；
     * * options：参数；
     * * maxContainer：设置拖动外围box，默认为body；
     * * minL：离外围边界左边最小距离，默认为0；
     * * maxL：离外边界左边最大距离，默认body的宽度-拖动对象宽度；
     * * minT：离外围边界上边最小距离，默认为0；
     * * maxT：离外围边界最大高度，默认为body高度-拖动对象高度；
     * * lockx：是否锁定X轴，默认不锁定；
     * * locky：是否锁定Y轴，默认不锁定；
     * * onStart：开始拖动回调函数；
     * * onMove：拖动过程中回调函数；
     * * onStop：拖动结束回调函数；
    */
    function Drag(){
    this.init.apply(this,arguments);
}
    Drag.prototype={
    init:function(dragBox,options){
    this.dragBox=this.$(dragBox);
    this.setOptions(options);
    console.log(this);
    this._moveDrag=this.bind(this,this.moveDrag);
    this._stopDrag=this.bind(this,this.stopDrag);
    this.maxContainer = this.options.maxContainer||document.documentElement || document.body;
    this.minL=this.options.minL||0;
    this.maxL=this.options.maxL||Math.max(this.maxContainer.clientWidth,this.maxContainer.scrollWidth)-this.dragBox.offsetWidth;
    this.minT=this.options.minT||0;
    this.maxT=this.options.maxT||Math.max(this.maxContainer.clientHeight,this.maxContainer.scrollHeight)-this.dragBox.offsetHeight;
    this.lockx = this.options.lockx||false;
    this.locky = this.options.locky||false;
    this.onStart=this.options.onStart||null;
    this.onMove=this.options.onMove||null;
    this.onStop=this.options.onStop||null;
    this.addHandle(this.dragBox, "mousedown", this.bind(this, this.startDrag));
    this.haslayout();
},
    haslayout:function(){
    this.dragBox.style.left=this.minL+"px";
    this.dragBox.style.top=this.minT+"px";
},
    startDrag:function(event){
    var event=event||window.event;
    this._x=event.clientX-this.dragBox.offsetLeft;
    this._y=event.clientY-this.dragBox.offsetTop;
    this.addHandle(document,"mousemove",this._moveDrag);
    this.addHandle(document,"mouseup",this._stopDrag);
    this.preventDefault(event);
    //MSIE 设置鼠标捕获信息
    this.dragBox.setCapture && this.dragBox.setCapture();
    if(typeof this.onStart==="function"){
        this.onStart();
    }
},
    moveDrag:function(event){
    var event=event||window.event;
    this.dragBox.style.cursor = "move";
    var le=event.clientX-this._x,to=event.clientY-this._y;
    if(le<this.minL){
    le=this.minL;
}else if(le>this.maxL){
    le=this.maxL;
}
    if(to<this.minT){
    to=this.minT;
}else if(to>this.maxT){
    to=this.maxT;
}
    if(!this.lockx){
    this.dragBox.style.left=le+"px";
}
    if(!this.locky){
    this.dragBox.style.top=to+"px";
}
    this.preventDefault(event);
    this.dragBox.setCapture && this.dragBox.setCapture();
    if(typeof this.onMove==="function"){
    this.onMove();
}
},
    stopDrag:function(){
    this.removeHandle(document,"mousemove",this._moveDrag);
    this.removeHandle(document,"mouseup",this._stopDrag);
    this.dragBox.style.cursor = "default";
    this.dragBox.setCapture && this.dragBox.setCapture();
    if(typeof this.onStop==="function"){
    this.onStop();
}
},
    $:function(id){
    return typeof id=="string" ? document.getElementById(id):id;
},
    addHandle:function(element,type,handler){
    if(element.addEventListener){
    element.addEventListener(type,handler,false);
}else if(element.attachEvent){
    element.attachEvent("on"+type,handler);
}else{
    element["on"+type]=handler;
}
},
    removeHandle:function(element,type,handler){
    if(element.removeEventListener){
    element.removeEventListener(type,handler,false);
}else if(element.detachEvent){
    element.detachEvent("on"+type,handler);
}else{
    element["on"+type]=null;
}
},
    preventDefault:function(event){
    if(event.preventDefault){
    event.preventDefault();
}else{
    event.returnValue=false;
}
},
    setOptions : function(options){
    this.options ={};
    for (var p in options) this.options[p] = options[p];
},
    bind : function (object, fnHandler){
    return function (){
    return fnHandler.apply(object, arguments)
}
}
};

