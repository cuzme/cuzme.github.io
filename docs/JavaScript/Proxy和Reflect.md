---
sidebar_position: 7
---
# Proxy和Reflect
## Proxy
Proxy是ES2015推出的新的功能，是代理的意思，它可以包装函数和对象，简单说就是给目标对象设置一个代理陷阱，一旦触发了陷阱便会执行对应的代码。

```javascript
let proxy = new Proxy(target, handle); // 用法

let target = {
    x: 10,
    y: 20
}

target = new Proxy(target, {
    get(obj, key) {
        return 30
    }
})

target.x // 30
target.y // 30
target.z // 30

// 上述代码中Proxy对目标对象属性值的获取进行了拦截，使其总是返回30
```

### 访问对象中不存在的属性我们给它一个默认值

```javascript
function withZeroValue(target, zeroValue) {
    return new Proxy(target, {
        get(obj, key) {
            if (key in obj) {
                return obj[key];
            } else {
                return zeroValue;
            }
        }
    });
}

let pos = {
    x: 28,
    y: 67,
}

pos = withZeroValue(pos, 0);

pos.x // 28
pos.y // 67
pos.z // 0
```

### 负数组索引

```javascript
function negativeArrayIndex(array) {
    return new Proxy(array, {
        get(obj, index) {
            index = Number(index); // 类型转换
            if (index < 0) {
                index = obj.length + index;
                return obj[index];
            } else {
                return obj[index];
            }
        }
    })
}

let arr = negativeArrayIndex([1, 2, 3, 4, 5, 6]);

arr[-1] // 6
arr[-2] // 5
```
### 隐藏属性

```javascript
function hide(target, prefix = '_') {
    return new Proxy(target, {
        has(obj, key) {
            return !key.startsWith(prefix) && (key in obj);
        },
        ownKeys(obj) {
            return Reflect.ownKeys(obj).filter((key) => !key.startsWith('_'));
        },
        get(obj, key, rec) {
            return (key in rec) ? obj[key] : undefined;
        }
    })
}

let obj = {
    'name': '张三',
    'age': 28,
    '_phoneNumber': 1277788999
}

let user = hide(obj);

user._phoneNumber // undefined
'_phoneNumber' in user // false
Object.keys(user) // ['name', 'age']
```

### 可以让对象内的属性只在一段时间内可以访问

```javascript
function ephemeral(target, time) {
    const creatTime = Date.now();
    const isExpired = () => (Date.now() - creatTime) > time;
    return new Proxy(target, {
        get(obj, key, rec) {
            return isExpired() ? undefined : Reflect.get(obj, key, rec);
        }
    })
}

let data = {
    price: 100,
    number: 38,
}

data = ephemeral(data, 5000); // 5s后失效

setTimeout(() => {
    console.log(data.price)
}, 3000); // 100

setTimeout(() => {
    console.log(data.price)
}, 6000); // undefined
```

### cookie的使用，核心思想就是把cookie作为一个对象来管理

```javascript
const getCookieObject = () => {
    const cookies = document.cookie.split(';').reduce((prev, cur) => {
        prev[cur.slice(0, cur.indexOf('=')).trim()] = cur.slice(cur.indexOf('=') + 1);
        return prev;
    }, {})
    const setCookie = (name, value) => document.cookie = `${name}=${value}`;
    const deleteCookie = (name) => document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    return new Proxy(cookies, {
        set(obj, key, value) {
            setCookie(key, value);
            return Reflect.set(obj, key, value);
        },
        deleteProperty(obj, key) {
            deleteCookie(key);
            return Reflect.deleteProperty(obj, key);
        }
    })
}

let cookies = getCookieObject();
cookies.has_recent_activity // '1'
cookies.has_recent_activity = '2' // '2'
delete cookies['has_recent_activity'] // true
```

### in运算符的重写

```javascript
const range = (min, max) => {
    return new Proxy(Object.create(null), {
        has(obj, key) {
            return min < key && key < max;
        }
    })
}

10 in range(4, 5) // false
10 in range(5, 20) // true
```