var data = {
    "front_end" : [
        'HTML',
        'Canvas',
        'Css',
        {
           'JavaScript': [
               'React',
               'Angular',
               'Vue',
               'Rx'
           ]
        },
        'Svg',
        {
            'WebGL': [
                'Matrix',
                'Axis'
            ]
        }
    ]
}

var state = {

};

var Tree = function(){
    this.initialize.apply(this, arguments);
}

Tree.prototype = {
    constructor: Tree,
    initialize: function(config){
        var me = this;
            me.container = ((typeof config.renderTo === "string") ? document.getElementById(config.renderTo) : config.renderTo) || document.body,
            me.data = config.data;
            me.open = config.open;

           this.generateFirstData(me.container, me.data, 0);

        if(!me.open){
            var closedElements = document.querySelectorAll('.wrapper');
            [].slice.call(closedElements, 0).forEach(function(index){
                index.onclick();
            })
        }

    },

    generateFirstData: function(parentWrapper ,data, counter){
        var results = [];
        for(var i in data){

            if(typeof data[i] === "object"){

                if(!(i * 1)) {
                    counter ++;
                var wrapper = document.createElement('div');
                    wrapper.className = 'wrapper';
                    wrapper.parent = parentWrapper;
                    var wrapperTitle = document.createElement('div');
                    wrapperTitle.id = i;
                    wrapperTitle.style.background = 'red';
                    wrapperTitle.innerHTML = i;
                    wrapper.appendChild(wrapperTitle);
                    parentWrapper.appendChild(wrapper);

                    wrapper.onclick = function (event) {
                        var id = this.firstElementChild.id;
                        var closeHeight = wrapperTitle.offsetHeight;
                        var parent = wrapperTitle.parentNode;
                        Tree.prototype.toggle(id, closeHeight, parent);

                        event && event.stopPropagation();
                    }

                    if(!this.open) {
                       state[i] = "open";
                    }
                    else{
                        state[i] = "close";
                    }

                }

                results.push(this.generateFirstData(wrapper || parentWrapper, data[i], counter));
            }
            else{
                var content = document.createElement('div');
                content.id = data[i];
                content.innerHTML = data[i];
                content.parent = parentWrapper;
                content.style.marginLeft = this.getMargin(counter) * 2 + "px";
                parentWrapper.appendChild(content);
                results.push(content);
            }
        }

     return results;
    },

    getMargin: function(counter){
        return counter * 4;
    },

    toggle: function(id, closeHeight, parent){

        if(state[id] === "open"){
            parent.style.height = closeHeight + "px";
            parent.style.overflow = "hidden";
            state[id] = "close"
        }
        else{
            parent.removeAttribute('style');
            state[id] = 'open';
        }
    }
}

new Tree({renderTo: 'tree', data: data, open: false});

