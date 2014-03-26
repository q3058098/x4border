(function (){

	var W3C = window.dispatchEvent;
	var nativeInput = document.createElement('input');

	var methods = [],
		eventMap = {};

	var log = function (a) {
        
        window.console && console.log(W3C ? a : a + "")
    }

	var getType = function (el){

		return Object.prototype.toString.call(el).toLowerCase().replace(/^\[object\s{1}|\]$/g,"");
	};

	var getNextSibling = function (el){
	    
	    if(el && el.nextSibling){
	        
	        if(el.nextSibling.nodeType==3) {
	         
	            while(el.nextSibling.id==undefined){
	          
	                el = el.nextSibling;
	          
	                sibling = el.nextSibling;// Moz. Opera .FF
	          
	                if(sibling==null){
	          
	                    break;
	                }
	            }
	            //sibling=el.nextSibling.nextSibling; // Moz. Opera .FF
	        }else {
	         
	            sibling=el.nextSibling; // IE
	        }
	        
	        return sibling;
	    
	    }else{
	     
	        return null;
	    }
	}

	var fixEvent = function (event) {
        
        var ret = {}
        
        for (var i in event) {
            ret[i] = event[i]
        }
        
        var target = ret.target = event.srcElement;
        
        if (event.type.indexOf("key") === 0) {
        
            ret.which = event.charCode != null ? event.charCode : event.keyCode
        
        } else if (/mouse|click/.test(event.type)) {
        
            var doc = target.ownerDocument || document.documentElement || document.body;
            var box = doc.compatMode === "BackCompat" ? doc.body : doc.documentElement;
            ret.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0);
            ret.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0);
        }
        
        ret.timeStamp = new Date - 0;
        ret.originalEvent = event;

        ret.preventDefault = function() { //阻止默认行为
            event.returnValue = false;
        }
        ret.stopPropagation = function() { //阻止事件在DOM树中的传播
            event.cancelBubble = true;
        }

        return ret;
    };

	var bind = function(el, type, fn, phase) { // 绑定事件
        
        var callback = W3C ? fn : function(e) {
         
            return fn.call(el, fixEvent(e))
        }
        if (W3C) {
        
            el.addEventListener(eventMap[type] || type, callback, !!phase)
        
        } else {
        
            el.attachEvent("on" + type, callback)
        }
        
        return callback
    };

	var x4border = function (config,callback){

		return x4border.fn.init(config,callback);
	};

	x4border.promptInfos = {

		require : "不能为空",
		email : "Email格式不正确",
		mobile : "手机号码应为11位数字，以13/14/15/17/18开头",
		number : "必须是数字",
		letter : "必须是字母",
		cn : "必须是中文",
		w : "英文,字母或下划线",
		cw : "中英文,字母或下划线"
	};

	x4border.regEx = {

		max : function (val){

			return new RegExp("^.{1,"+val+"}$");
		},
		min : function(val){

			return new RegExp("^.{"+val+",}$");
		},
		limit : function (less,more){

			return new RegExp("^.{"+less+","+more+"}$");
		},
		require : function (){

			return /^.+$/;
		},
		email : function (){

			return /^(\w)+(\.\w+)*@(\w)+((\.\w+))$/;
		},
		mobile : function (){

			return /^((\+86)|(86))?(13|14|15|17|18)\d{9}$/;
		},
		number : function (less,more){

			return new RegExp("^[0-9]{"+less+","+more+"}$");
		},
		letter : function (less,more){

			return new RegExp("^[a-zA-Z]{"+less+","+more+"}$");
		},
		cn : function (less,more){

			return new RegExp("^[\u4e00-\u9fa5]{"+less+","+more+"}$");
		},

		w : function (less,more){

			return new RegExp("^[_a-zA-Z0-9]{"+less+","+more+"}$");
		},

		cw : function (less,more){

			return new RegExp("^[\u4e00-\u9fa5_a-zA-Z0-9]{"+less+","+more+"}$");
		}
	};

	x4border.types = function (el,val,funcName){

		if(val && getType(val.split("_")) === "array"){

			var valSplit = val.split("_"),
				less = valSplit[0],
				more = valSplit[1];
			
			var addPrompt = "";
		
			if (funcName == "min") {
				
				addPrompt = "长度不足" + val + "个字符";
		    
		    }else if(funcName == "max"){

		    	addPrompt = "长度不能超过" + val + "个字符";
		    
		    }else{

		    	addPrompt = (x4border.promptInfos[funcName] || "") + 
		    					"    长度在" + less + "-" + more + "个字符之间";
		    }
				
			validate(el,x4border.regEx[funcName](less,more),addPrompt);

		}else{

			validate(el,x4border.regEx[funcName](1,""),x4border.promptInfos[funcName]);
		}
	}

	x4border.fn = x4border.prototype = {

		constructor : x4border,

		init : function (config,callback){

			//获取作用范围,优先为config.parent,未填则默认为document
			var parent = config && getType(config) === "object" && config.parent
					? document.getElementById(config.parent) 
					: document;

			//根据外部配置添加验证方法
			if(config && getType(config) === "object"){

				//何时触发验证,默认为blur
				var events = config.events;
				var configures = config.configure;

				x4border.events = events;
				
				x4border.errorMsg = config.errorMsg;

				if(configures){

					if(getType(configures) !== "array"){
					
						log("configure必须是一个数组");
						
						return
					}

					//根据配置给正则列表和提示列表添加信息和方法
					for(var n=0,len=configures.length;n<len;n++){

						var cfg = configures[n],
							typeName = cfg["name"];

						x4border.regEx[typeName] = function (){

							return cfg["reg"];
						};

						x4border.promptInfos[typeName] = cfg["prompt"];
					}
				}		
			}else {

				x4border.events = "blur";
				x4border.errorMsg = "这里错了=,=!";
			}

			//如果没有填写参数,且第一个参数为function类型,则为回调,否则第二个参数为回调
			this.callback = function (){

				if(getType(config) === "function"){

					return config();

				}else if(getType(callback) === "function"){

					return callback();
				
				}else{

					return
				}
			};

			this.tags = parent.getElementsByTagName('input');
					
				var i = 0,
					tagsLen = this.tags.length;

			var loopMethod = [];

			x4border.valiResult = [];

			//循环所有匹配到的input
			for(; i<tagsLen; i++){

				//对x4-结构进行匹配
				var otrHTML = this.tags[i].outerHTML,
					findX4Re = /\bx4-[\w\"=]*\s?\b/g,
					types = otrHTML.match(findX4Re);
					
					//将正则表达式编译为内部格式，从而更快地执行。
					findX4Re.compile("\bx4-[\w\"=]*\s?\b","g");

				//如果没有匹配到任何值则return
				if(getType(types) === "array"){

					var typeArray = types.join(",").replace(/\s*/g,""),

					re = /x4-(\w*)\s?=?\s?\"?(\w*)\"?/g,

					getSearchResult = function ($numeric){

						return typeArray.replace(re,$numeric).split(",");
					},
					//匹配到的方法名
					method = getSearchResult("$1"),

					//匹配到的方法结果
					value = getSearchResult("$2");

					re.compile("x4-(\w*)\s?=?\s?\"?(\w*)\"?","g");

					methods.push({

						"name" : method,
						"value" : value
					});

					var bool = method == "submit";

					x4border.valiResult.push(bool);
					
				}else{

					methods.push({ "name" : "",
						"value" : "" });

					x4border.valiResult.push(true);
				}
			}

			this.eventEmitter();
		},

		eventEmitter : function (){

			var _this = this;
		
			//遍历所有匹配到的元素
			for(var i=0,len=this.tags.length;i<len;i++){

				this.tags[i].index = i;

				var _this = this;

				var ii = 0;

				//当点击,确认需要调用的方法及确认结果范围
				bind(this.tags[i],"focus",function (){

					for(var i in methods[this.index]){

						for(var j in methods[this.index][i]){

							//空的方法需要return掉
							if(methods[this.index][i][j] == "") return

							var currentMethod = methods[this.index]["name"][j];
							var limitValue = methods[this.index]["value"][j];

							//当为确认事件
							if(currentMethod === "submit"){

								var val = true;
								var someoneError = 0;

								for(var k=0,len=x4border.valiResult.length;k<len;k++){

									if (x4border.valiResult[k] != true) {

										val = false; someoneError = k;

										break;
									}
								}

								if(val){

									if(getType(_this.callback) === "function") _this.callback();

								}else{
									
									_this.tags[someoneError].focus();
									
									sysvali(_this.tags[someoneError],/\s{1000}/,x4border.errorMsg);
								}
							}
							//在方法库中找到所需方法才继续执行
							else if(x4border.regEx.hasOwnProperty(currentMethod)){

								x4border.types(this,limitValue,currentMethod);
							}
						}
					}
				});
			}
		}
	};

	x4border.fn.init.prototype = x4border.fn;

	//如果找不到用来放置验证结果的地方就创建一个span
	var createValiSpan = function (el){

		if(!getNextSibling(el) || getType(getNextSibling(el)) == "comment"){
			
			var validateResultSpan = document.createElement("span");

			validateResultSpan.setAttribute("class","x4ValiResult");

			el.parentNode.appendChild(validateResultSpan);
		}
	};

	var validate = function (el,re,prompt){

		if(!el) return;

		var _this = this;

		bind(el,x4border.events,function (){

			//如果没有临近的子节点放置验证结果则创建一个默认的
			createValiSpan(el);

			var elSiblings = getNextSibling(el);

			if(re.test(this.value)){

				elSiblings.style.display = "none";
				elSiblings.innerHTML = "";

				x4border.valiResult[this.index] = true;

			}else{

				elSiblings.style.display = "block";
				elSiblings.innerHTML = prompt;

				x4border.valiResult[this.index] = false;
			}
		});
	};

	var sysvali = function (el,re,prompt){

		//如果没有临近的子节点放置验证结果则创建一个默认的
		createValiSpan(el);
		var elSiblings = getNextSibling(el);

		elSiblings.style.display = "block";
		elSiblings.innerHTML = prompt;
	};

	if ( typeof module === "object" && module && typeof module.exports === "object" ) {
	
		module.exports = x4border;
		
	} else {
		
		if ( typeof define === "function" && define.amd ) {

			define( "x4border", [], function () { return x4border; } );
		}
	}

	if(!window.x4border) window.x4border = x4border;
})()
