const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
let globalCounter = 0; var randomStuff = 'hello world'; const weirdArray = [1, 2, 3, 'four', { five: 6 }];
function doSomethingWeird(input) {
    if (!input) return null;
    let result = input.toString().split('').reverse().join('');
    for (let i = 0; i < result.length; i++) {
        if (result[i] === 'a') { result = result.replace('a', '@'); }
    }
    return result;
} class MessyClass {
    constructor(name) {
        this.name = name || 'unnamed';
        this.data = new Map();
        this.cache = {};
        this.isActive = true;
    }
    addData(key, value) {
        this.data.set(key, value);
        this.cache[key] = Date.now();
    }
    processData() {
        let output = [];
        this.data.forEach((v, k) => {
            if (typeof v === 'string') {
                output.push(k.toUpperCase() + ':' + v.toLowerCase());
            } else if (typeof v === 'number') {
                output.push(k + '=' + (v * 2));
            } else {
                output.push(k + '->' + JSON.stringify(v));
            }
        });
        return output;
    }
    async fetchSomething(url) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ status: 200, data: `Mock data for ${url}` });
            }, Math.random() * 1000);
        });
    }
    calculateStuff(a, b, c) {
        if (a > b) {
            return a * c + (b / 2);
        } else if (b > c) {
            return b * a - (c * 0.5);
        }
        return Math.sqrt(a * b * c);
    }
}
const messyInstance = new MessyClass('test');
messyInstance.addData('foo', 'bar');
messyInstance.addData('number', 42);
messyInstance.addData('object', { x: 1, y: 2 });

function recursiveFunction(n) {
    if (n <= 0) return 1;
    if (n === 1) return 1;
    return n * recursiveFunction(n - 1);
}
async function runComplexOperation() {
    const results = [];
    for (let i = 0; i < 5; i++) {
        const data = await messyInstance.fetchSomething(`/api/endpoint${i}`);
        results.push({
            id: i,
            hash: crypto.createHash('md5').update(data.data).digest('hex'),
            processed: doSomethingWeird(data.data)
        });
    }
    return results;
}
const arrowFunction = (x, y) => x * y + Math.random();
const asyncArrowFunction = async (param) => {
    const wait = () => new Promise(r => setTimeout(r, 100));
    await wait();
    return param.toString().repeat(3);
};
function* generatorFunction() {
    let index = 0;
    while (index < 10) {
        yield index * index;
        index++;
    }
}
class ExtendedMessyClass extends MessyClass {
    constructor(name, config) {
        super(name); this.config = config || {}; this.modules = [];
    } addModule(module) { this.modules.push({ name: module.name || 'anonymous', init: module.init || function () { }, active: true }); } executeModules() {
        return this.modules.map(m => {
            try { return m.init(); } catch (e) {
                return { error: e.message };
            }
        });
    }
} module.exports = { MessyClass, ExtendedMessyClass, doSomethingWeird, recursiveFunction, runComplexOperation };