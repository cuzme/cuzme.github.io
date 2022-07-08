---
sidebar_position: 1
---

# JSON.stringify()

### 1. toJSON 方法

如果一个被序列化的对象拥有 `toJSON` 方法，那么该 `toJSON` 方法就会覆盖该对象默认的序列化行为：不是该对象被序列化，而是调用 toJSON 方法后的返回值会被序列化，例如：

```javascript
let obj = {
    a: 'a',
    b: 'b',
    toJSON: function () {
        console.log('toJSON method is called');
        return {c: 'c'};
    }
};

JSON.stringify(obj);  // toJSON method is called {"c":"c"}
```

### 2. Boolean、Number、String 对象在字符串化过程中被转换为对应的原始值

```javascript
let obj = {
    a: new Number(1),
    b: new String('b'),
    c: new Boolean(true),
};

JSON.stringify(obj);  // {"a":1,"b":"b","c":true}
```

### 3. undefined、Function、Symbol 不是有效的 JSON 值。如果在转换过程中遇到任何此类值，它们会被忽略（在对象中找到），或者被更改为 null（当在数组中找到时）。

```javascript
let obj = {
    a: undefined,
    b: Symbol('b'),
    c: function () {}
};

JSON.stringify(obj)  // {}
```

```javascript
let arr = [undefined, Symbol('a'), function () {}, 1, 2]

JSON.stringify(arr);  // [null, null, null, 1, 2]
```

### 4. 所有使用 Symbol 作为对象 键值 的属性将会被忽略

```javascript
let obj = {};
obj[Symbol('name')] = 'John';
obj[Symbol('age')] = 28;

JSON.stringify(obj);  // {}
```


### 5. 使用 new Date()

```javascript
JSON.stringify(new Date());  // "2022-07-02T16:58:51.554Z"
```

### 6. Infinity、NaN、null都会被认为是 null

```javascript
let obj = {
    a: Infinity,
    b: NaN,
    c: null
};

JSON.stringify(obj);  // {"a":null,"b":null,"c":null}
```

### 7. 所有其他 Object 实例（包括 Map、Set、WeakMap 和 WeakSet）将仅序列化其可枚举的属性。

```javascript
let obj = {};
Object.defineProperties(obj, {
    name: {
        value: 'John',
        enumerable: false
    },
    age: {
        value: 28,
        enumerable: true,
    }
})

JSON.stringify(obj);  // {"age":28}
```

### 8. 找到循环引用时抛出TypeError异常。
```javascript
let obj = {
    name: 'John',
    age: 28,
};

obj.person = obj;

JSON.stringify(obj);  // TypeError: Converting circular structure to JSON
```

### 9. 对 BigInt 值进行字符串化时抛出TypeError异常。
```javascript
let obj = {
    a: BigInt(12223344445),
};

JSON.stringify(obj);  // TypeError: Do not know how to serialize a BigInt
```

### 11. JSON.stringify()的第二个参数可以传一个函数，可以帮助我们转译字符串的时候排除一些我们不想要的值。

1.下面这个例子我们发现当我们传入`replace`函数后，我们可以排除掉所有`value`类型是字符串的键值对，只保留`value`类型是数字的键值对。
```javascript
let obj = {
    name: '张三',
    age: 28,
    weight: 120,
    job: '老师'
};

function replace (key, value) {
    if(typeof value === 'string'){
        return undefined;
    }
    return value;
}   

JSON.stringify(obj, replace);  // '{"age":28,"weight":120}'
```

2.下面这个例子比上面的例子复杂一点，但是我们不难看出`JSON.stringify()`的第二个参数还具有递归的特性，类似深拷贝，所以里层嵌套的属性也是可以生效的。

```javascript
let obj = {
    name: '张三',
    age: 28,
    list: [
        {name: 'xxx1', age: 25},
        {name: 'xxx2', age: 32},
        {name: 'xxx3', age: 43},
        {list: {name: 'xxx4', age: 54}},
    ]
};

function replace (key, value) {
    if(typeof value === 'string'){
        return undefined;
    }
    return value;
}   

JSON.stringify(obj, replace);  // '{"age":28,"list":[{"age":25},{"age":32},{"age":43},{"list":{"age":54}}]}'
```
3.另外它的第二个参数也可以是数组形式的如下面的例子所示，可以实现只转译我们需要的键值对。
```javascript
let obj = {
    name: '张三',
    age: 28,
    list: [
        {name: 'xxx1', age: 25},
        {name: 'xxx2', age: 32},
        {name: 'xxx3', age: 43},
        {list: {name: 'xxx4', age: 54}},
    ]
};

JSON.stringify(obj, ['name', 'list']);  // '{"name":"张三","list":[{"name":"xxx1"},{"name":"xxx2"},{"name":"xxx3"},{"list":{"name":"xxx4"}}]}'
```

### 11.JSON.stringify()的第三个参数可以实现以下效果。
```javascript
let obj = {
    name: '张三',
    age: 28,
    list: [
        {name: 'xxx1', age: 25},
        {name: 'xxx2', age: 32},
        {name: 'xxx3', age: 43},
        {list: {name: 'xxx4', age: 54}},
    ]
};

JSON.stringify(obj, null, 'aaa');

// {
//   aaa"name": "张三",
//   aaa"age": 28,
//   aaa"list": [
//   aaaaaa{
//   aaaaaaaaa"name": "xxx1",
//   aaaaaaaaa"age": 25
//   aaaaaa},
//   aaaaaa{
//   aaaaaaaaa"name": "xxx2",
//   aaaaaaaa"age": 32
//   aaaaaa},
//   aaaaaa{
//   aaaaaaaaa"name": "xxx3",
//   aaaaaaaaa"age": 43
//   aaaaaa},
//   aaaaaa{
//   aaaaaaaaa"list": {
//   aaaaaaaaaaaa"name": "xxx4",
//   aaaaaaaaaaaa"age": 54
//   aaaaaaaaa}
//   aaaaaa}
//   aaa]
// }
```




