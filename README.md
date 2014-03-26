x4border
=========
x4border是一个验证插件,允许自定义正则规则,采用原生Javascript编写,不依赖任何库或框架,支持AMD规范

首先在页面底部或window.load/$(document).ready() 中引入 x4border.js


example:
          
        在需要验证的input中加入x4-someLabel.
        
        如：<input type="text" x4-max="10" />    
        然后在页面中调用x4border();他就可以动运行了
            
        x4border会寻找input后的一个元素作为验证结果的存放,
        不如不存在会自动创建一个class为x4ValiResult的span元素用来存放验证结果,
        当然css需要你去完成
                
x4border的参数:

    x4border({
        
        events : "blur",    //何时触发验证,默认为blur,你可以填写keyup等事件来事实验证所填内容        
        parent : "document",  //目前只支持id选择器,填写一个id,
                              //x4border只会在这个元素的内部寻找x4-格式的元素    
        configure : [            //configure必须要是一个数组,里面填写你要添加的验证格式
            
             {
                 "name" : "haha",            //验证的名字
                 "reg" : /^haha$/,           //验证这种类型需要的正则表达式
                 "prompt" : "你要填写haha"    //验证结果为错误时的提示信息
             }   
        ],  //填写完毕后,你就可以在input中添加了 如:<input x4-haha>      
        
        errorMsg : "这里错了=,="        //当提交表单时,如果需要验证的项里还有错误信息,
                                      //x4border会提示用户哪里错了,并给出提示信息
        
    },function (){
    
        //回调函数callback
        //需要一个<input x4-submit />
        //当所需验证的结果全部正确后,会调用callback
    })
    
    //参数可以不填写,如只使用callback可以直接填写x4border(function (){ ... });



x4border自带的表单验证:
    max     : x4-max="10"        长度最多为10 
    min     : x4-min="5"         长度最少为5
    limit   : x4-limit="10_20"   长度在10-20之间
    require : x4-require         必填项
    email   : x4-email           email
    mobile  : x4-mobile          手机号
    number  : x4-number          数字
            : x4-number="5_10"   数字的长度为5-10
    letter  : x4-letter          英文字母
            : x4-letter="10_20"  英文字母长度为10-20              
	cn      : x4-cn              汉字
	        : x4-cn="10_20"      汉字的长度为10-20
    w       : x4-w               英文字母,数字,下划线
            : x4-w="10_20"       英文字母,数字,下划线的长度为10-20
    cw      : x4-cw              汉字,英文,数字,下划线        
            : x4-cw="10_20"      汉字,英文,数字,下划线的长度为10-20  

