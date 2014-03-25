(function (){

	var promptInfos = {

		max : "最大长度为%s!",
		min : "最小长度为%s!",
		limit : "",
		require : "此项为必填项",
		email : "请填写正确的邮箱地址！",
		mobile : "请填写正确的手机号码！"
	};

	var regEx = {

		max : function (val){

			return new RegExp("^.{0,"+val+"}$");
		},
		min : function(val){

			return new RegExp("^.{"+val+",}$");
		},
		limit : function (val,val2){

			return new RegExp("^.{"+val+","+val2+"}$");
		},
		require : function (){

			return /^.+$/;
		},
		email : function (){

			return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
		},
		mobile : function (){

			return /^((\+86)|(86))?(13)\d{9}$/;
		}
	};

	var types = {

		max : function (el,val){

			validate(el,regEx.max(val),promptInfos.max.replace(/%s/,val));
		},
		min : function (el,val){

			validate(el,regEx.min(val),promptInfos.min.replace(/%s/,val));
		},
		limit : function (el,val){

			var val = val.split("_"),
				less = val[0],
				more = val[1];

			validate(el,regEx.limit(less,more),"长度在"+less+"-"+more+"之间!");
		},
		require : function (el,val){

			validate(el,regEx.require(val),promptInfos.require);
		},
		email : function (el,val){

			validate(el,regEx.email(val),promptInfos.email);
		},
		mobile : function (el,val){

			validate(el,regEx.mobile(val),promptInfos.mobile);
		}
	};

	var W3C = window.dispatchEvent;
	var nativeInput = document.createElement('input');

	var methods = [];

	var getType = function (el){

		return Object.prototype.toString.call(el).toLowerCase().replace(/^\[object\s{1}|\]$/g,"");
	};

	var bind = function(el, type, fn) {

        if (W3C) {

            el.addEventListener(type, fn, false);
        
        } else {

            el.attachEvent("on" + type, fn);
        }
    };

	var x4border = function (config,callback){

		return x4border.fn.init(config,callback);
	};

	x4border.fn = x4border.prototype = {

		constructor : x4border,

		init : function (config,callback){

			//获取作用范围,优先为config.parent,未填则默认为document
			var parent = getType(config) == "object" && config.parent 
					? document.getElementById(config.parent) 
					: document;
			
			this.callback = function (){

				return (getType(config) === "function" || getType(callback) === "function") 
					&&	getType(config) === "function" 
						? config() 
						: callback();
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
					types = otrHTML.match(/\bx4-[\w\"=]*\s?\b/g)

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

					methods.push({

						"name" : method,
						"value" : value
					});

					var bool = method == "submit";

					x4border.valiResult.push(bool);
					
				}else{

					methods.push({ "name" : "",
						"value" : ""
					});

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

				//当点击,确认需要调用的方法及确认结果范围
				bind(this.tags[i],"focus",function (){
					
					for(var i in methods[this.index]){

						for(var j in methods[this.index][i]){

							var currentMethod = methods[this.index]["name"][j];
							var limitValue = methods[this.index]["value"][j];

							//当为确认事件
							if(currentMethod === "submit"){

								var val = true;
								var someoneError = 0;

								for(var k=0,len=x4border.valiResult.length;k<len;k++){

									if (x4border.valiResult[k] != true) {

										val = false;

										someoneError = k;

										break;
									};
								}

								if(val){

									if(getType(_this.callback) === "function") _this.callback();

								}else{
									
									_this.tags[someoneError].focus();
									
									sysvali(_this.tags[someoneError],/\s{1000}/,"这里错了.");

									this.blur();
								}
							}
							//在方法库中找到所需方法才继续执行
							else if(types.hasOwnProperty(currentMethod)){

								types[currentMethod](this,limitValue);
							}
						}
					}
				});
			}
		}
	};

	x4border.fn.init.prototype = x4border.fn;

	var validate = function (el,re,prompt){

		if(!el) return;

		var _this = this;

		bind(el,"keyup",function (){

			//如果没有临近的子节点放置验证结果则创建一个默认的
			if(!el.nextSibling){

				var validateResultSpan = document.createElement("span");
				validateResultSpan.style.cssText = "padding:5px 10px; background: #f00; color:#fff; display: none; border-radius: 2px; font-size:12px; float:left";

				el.parentNode.appendChild(validateResultSpan);
			}

			if(re.test(this.value)){

				el.nextSibling.style.display = "none";
				el.nextSibling.innerHTML = "";

				x4border.valiResult[this.index] = true;

			}else{

				el.nextSibling.style.display = "block";
				el.nextSibling.innerHTML = prompt;

				x4border.valiResult[this.index] = false;
			}
		});
	};

	var sysvali = function (el,re,prompt){

		//如果没有临近的子节点放置验证结果则创建一个默认的
		if(!el.nextSibling){

			var validateResultSpan = document.createElement("span");
			validateResultSpan.style.cssText = "padding:5px 10px; background: #f00; color:#fff; display: none; border-radius: 2px; font-size:12px;";

			el.parentNode.appendChild(validateResultSpan);
		}

		if(re.test(this.value)){

			el.nextSibling.style.display = "none";
			el.nextSibling.innerHTML = "";

			x4border.valiResult[this.index] = true;

		}else{

			el.nextSibling.style.display = "block";
			el.nextSibling.innerHTML = prompt;

			x4border.valiResult[this.index] = false;
		}
	}

	if ( typeof module === "object" && module && typeof module.exports === "object" ) {
	
		module.exports = x4border;
		
	} else {
		
		if ( typeof define === "function" && define.amd ) {
			define( "x4border", [], function () { return x4border; } );
		}
	}

	if(!window.x4border) window.x4border = x4border;
})()
