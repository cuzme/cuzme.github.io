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



