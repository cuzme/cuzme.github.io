---
sidebar_position: 5
---

目前，单页应用已日益成为前端的主流。单页应用程序的一个主要特点是使用前端路由。前端直接控制路由跳转逻辑，而不是由后端人员控制，这给了前端更多的自由度。

前端路由的实现方法主要有两种：`hash` 和 `history`，下面说下他们两者的主要区别：


### Hash 

```text
www.example.com/index.html#chapter1
```
- 这个地址中我可以找到#chapter1这个#后面的值代表hash值
- 这个地址代表www.example.com域名下的index.html页面下的chapter1位置
- 使用a标签<a href="#chapter1">跳转</a>可以帮助我们跳转到该位置
- 所以改变#后边的内容也就不会重新发送请求，会发生位置的改变（跳到当前页面的某个位置）
- 改变#会改变浏览器的历史，会产生一条新的历史记录
- window.location.hash 获取当前页面的hash值 `#chapter1`
- window.onhashchange = function (){} 当页面hash改变（#后面的值）会触发`onhashchange`事件

下面是一个简单例子：

```html
<h1 id="title">首页</h1>
<ul>
    <li><a href="#home">HomePage</a></li>
    <li><a href="#list">ListPage</a></li>
    <li><a href="#setting">SettingPage</a></li>
</ul>
<script>
    
    window.onhashchange = function () {
        const hash = location.hash;
        const dom = document.getElementById('title');
        if (hash === 'home') {
            dom.innerHTML = '首页';
            return;
        }
        if (hash === 'list') {
            dom.innerHTML = '列表页';
            return;
        }
        if (hash === 'setting') {
            dom.innerHTML = '设置页';
            return;
        }
        dom.innerHTML = '404';
    }

    // 上述实现方法相对简单，我们可以再次封装它

    class Router {

        constructor () {
            this.routes = [];
        }

        add(route, name) {
            this.routes.push({path: route, name})
        }
        
        listen(callback) {
            window.onhashchange = this.hashChange(callback);
        }

        hashChange(callback) {
            return () => {
                let hash = location.hash;
                for (let i = 0; i < this.routes.length; i++) {
                    let curRoute = this.routes[i];
                    if (hash === curRoute.path) {
                        callback(curRoute.name);
                        return;
                    } 
                }
                return callback('404');
            }
        }
        
    }
    
    let router = new Router();

    router.add('#home', '首页');
    router.add('#list', '列表页');
    router.add('#setting', '设置页');

    router.listen(function (name) {
        document.getElementById('title').innerHTML = name;
    })
    
    // 实现路由器并通过add方法添加路由配置。
    // 第一参数为路由路径，第二个参数为路由名称，通过监听哈希更改把对应路由的名称填入dom中。

</script>
```

### History

history 接口允许操作浏览器的曾经在标签页或者框架里访问的会话历史记录。

- `history.length` 返回一个整数，该整数表示会话历史中元素的数目，包括当前加载的页。例如，在一个新的选项卡加载的一个页面中，这个属性返回 1。
- `history.state` 可以获取当前页面的状态信息的属性
- `history.back()` 在浏览器历史记录里前往上一页，等价于 `history.go(-1)`
- `history.forward()` 在浏览器历史记录里前往下一页，等价于 `history.go(1)`
- `history.go()` 通过当前页面的相对位置从浏览器历史记录加载页面
- `history.pushState()` 将记录附加到历史记录中
- `history.replaceState()` 替换历史记录中当前页面的信息
- `window.onpopstate` 在浏览器中使用`前进`、`后退`、`history.go()`、`history.back()`、`history.forward()` 会触发此事件

下面是一个简单例子：

```html
<h1 id="title">首页</h1>
<ul id="ul">
    <li><a href="/home">HomePage</a></li>
    <li><a href="/list">ListPage</a></li>
    <li><a href="/setting">SettingPage</a></li>
</ul>
<script>
    function renderInnerHtml(path) {
        let title = document.getElementById('title');
        if (path === '/home') {
            title.innerHTML = '首页';
        } else if (path === '/list') {
            title.innerHTML = '列表页';
        } else if (path === '/setting') {
            title.innerHTML = '设置页';
        } else {
            title.innerHTML = '404';
        }
    }

    const ul = document.getElementById('ul');

    ul.onclick = function (e) {
        e.preventDefault();
        if (e.target.nodeName === 'A') {
            let path = e.target.getAttribute('href');
            window.history.pushState({}, '', path); // 改变地址栏中的地址
            renderInnerHtml(path);
        }
    }

    window.onpopstate = function () {
        renderInnerHtml(location.pathname);
    }

    // 上述实现方法相对简单，我们可以再次封装它

    class Router {
        constructor() {
            this.routes = [];
        }

        add(path, name) {
            this.routes.push({path, name});
        }

        pushState(path, data = {}) {
            window.history.pushState(data, '', path)
            this.renderInnerHtml(path)
        }

        listen(callback) {
            this.renderCallback = callback;
            this.changeA();
            window.onpopstate = () => {
                this.renderInnerHtml(location.pathname);
            }
        }
        
        changeA () {
            document.addEventListener('click', (e) => {
                if (e.target.nodeName === 'A') {
                    e.preventDefault();
                    let path = e.target.getAttribute('href')
                    this.pushState(path)
                }
            })
        }

        renderInnerHtml (path) {
            for (let i = 0; i < this.routes.length; i++) {
                let curRoute = this.routes[i];
                if (path === curRoute.path) {
                    this.renderCallback(curRoute.name);
                    return;
                }
            }
        }
    }


    let router = new Router();
    
    router.add('./home', '首页');
    router.add('/list', '列表页');
    router.add('/setting', '设置页');

    router.listen((name) => {
        document.getElementById('title').innerHTML = name;
    });
    
</script>
```

### Hash 与 History 的区别

- hash 中含有"#"字符，history 相对优雅。
- pushState 设置的新url可以是与当前url同源的任何url，hash只能修改"#"字符以后部分，因此只能设置与当前文档相同的url。
- pushState 设置的新url可以与当前url完全相同，从而将记录添加到堆栈中，hash设置的新值必须与原始值不同才能触发记录入栈。
- pushState 可以添加更多的数据类型在它的第一个字段中，hash只可以添加字符串。
- pushState 可以设置title字段。
- hash 兼容ie8+， history 兼容ie10+。
- history模式需要后端配合，将所有访问指向索引HTML，否则刷新页面将导致404。