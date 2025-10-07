class Node {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.parent = null;
        this.color = 'RED';
    }
}

class TreeNode extends Node {
    constructor(data) {
        super(data);
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }
}

class GraphNode {
    constructor(value) {
        this.value = value;
        this.adjacent = new Set();
        this.visited = false;
        this.distance = Infinity;
        this.previous = null;
        this.inDegree = 0;
        this.outDegree = 0;
    }

    addEdge(node, weight = 1) {
        this.adjacent.add({ node, weight });
        this.outDegree++;
        node.inDegree++;
    }

    removeEdge(node) {
        for (let edge of this.adjacent) {
            if (edge.node === node) {
                this.adjacent.delete(edge);
                this.outDegree--;
                node.inDegree--;
                break;
            }
        }
    }
}

class AVLTree {
    constructor() {
        this.root = null;
        this.size = 0;
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    updateHeight(node) {
        if (node) {
            node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
        }
    }

    rotateRight(y) {
        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        this.updateHeight(y);
        this.updateHeight(x);

        return x;
    }

    rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        this.updateHeight(x);
        this.updateHeight(y);

        return y;
    }

    insert(data) {
        this.root = this.insertNode(this.root, data);
        this.size++;
    }

    insertNode(node, data) {
        if (!node) {
            return new Node(data);
        }

        if (data < node.data) {
            node.left = this.insertNode(node.left, data);
        } else if (data > node.data) {
            node.right = this.insertNode(node.right, data);
        } else {
            return node;
        }

        this.updateHeight(node);

        const balance = this.getBalance(node);

        if (balance > 1 && data < node.left.data) {
            return this.rotateRight(node);
        }

        if (balance < -1 && data > node.right.data) {
            return this.rotateLeft(node);
        }

        if (balance > 1 && data > node.left.data) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }

        if (balance < -1 && data < node.right.data) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    delete(data) {
        this.root = this.deleteNode(this.root, data);
        this.size--;
    }

    deleteNode(node, data) {
        if (!node) return node;

        if (data < node.data) {
            node.left = this.deleteNode(node.left, data);
        } else if (data > node.data) {
            node.right = this.deleteNode(node.right, data);
        } else {
            if (!node.left || !node.right) {
                const temp = node.left || node.right;
                if (!temp) {
                    node = null;
                } else {
                    node = temp;
                }
            } else {
                const temp = this.findMin(node.right);
                node.data = temp.data;
                node.right = this.deleteNode(node.right, temp.data);
            }
        }

        if (!node) return node;

        this.updateHeight(node);

        const balance = this.getBalance(node);

        if (balance > 1 && this.getBalance(node.left) >= 0) {
            return this.rotateRight(node);
        }

        if (balance > 1 && this.getBalance(node.left) < 0) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }

        if (balance < -1 && this.getBalance(node.right) <= 0) {
            return this.rotateLeft(node);
        }

        if (balance < -1 && this.getBalance(node.right) > 0) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    findMin(node) {
        while (node.left) {
            node = node.left;
        }
        return node;
    }

    search(data) {
        return this.searchNode(this.root, data);
    }

    searchNode(node, data) {
        if (!node || node.data === data) {
            return node;
        }

        if (data < node.data) {
            return this.searchNode(node.left, data);
        }

        return this.searchNode(node.right, data);
    }

    inOrder() {
        const result = [];
        this.inOrderTraversal(this.root, result);
        return result;
    }

    inOrderTraversal(node, result) {
        if (node) {
            this.inOrderTraversal(node.left, result);
            result.push(node.data);
            this.inOrderTraversal(node.right, result);
        }
    }
}

class RedBlackTree {
    constructor() {
        this.NIL = new Node(null);
        this.NIL.color = 'BLACK';
        this.NIL.left = null;
        this.NIL.right = null;
        this.root = this.NIL;
    }

    insert(data) {
        const newNode = new Node(data);
        newNode.left = this.NIL;
        newNode.right = this.NIL;

        let parent = null;
        let current = this.root;

        while (current !== this.NIL) {
            parent = current;
            if (newNode.data < current.data) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        newNode.parent = parent;

        if (parent === null) {
            this.root = newNode;
        } else if (newNode.data < parent.data) {
            parent.left = newNode;
        } else {
            parent.right = newNode;
        }

        if (newNode.parent === null) {
            newNode.color = 'BLACK';
            return;
        }

        if (newNode.parent.parent === null) {
            return;
        }

        this.insertFixup(newNode);
    }

    insertFixup(node) {
        while (node.parent && node.parent.color === 'RED') {
            if (node.parent === node.parent.parent.right) {
                const uncle = node.parent.parent.left;
                if (uncle && uncle.color === 'RED') {
                    uncle.color = 'BLACK';
                    node.parent.color = 'BLACK';
                    node.parent.parent.color = 'RED';
                    node = node.parent.parent;
                } else {
                    if (node === node.parent.left) {
                        node = node.parent;
                        this.rightRotate(node);
                    }
                    node.parent.color = 'BLACK';
                    node.parent.parent.color = 'RED';
                    this.leftRotate(node.parent.parent);
                }
            } else {
                const uncle = node.parent.parent.right;
                if (uncle && uncle.color === 'RED') {
                    uncle.color = 'BLACK';
                    node.parent.color = 'BLACK';
                    node.parent.parent.color = 'RED';
                    node = node.parent.parent;
                } else {
                    if (node === node.parent.right) {
                        node = node.parent;
                        this.leftRotate(node);
                    }
                    node.parent.color = 'BLACK';
                    node.parent.parent.color = 'RED';
                    this.rightRotate(node.parent.parent);
                }
            }

            if (node === this.root) {
                break;
            }
        }

        this.root.color = 'BLACK';
    }

    leftRotate(x) {
        const y = x.right;
        x.right = y.left;
        if (y.left !== this.NIL) {
            y.left.parent = x;
        }
        y.parent = x.parent;
        if (x.parent === null) {
            this.root = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }
        y.left = x;
        x.parent = y;
    }

    rightRotate(x) {
        const y = x.left;
        x.left = y.right;
        if (y.right !== this.NIL) {
            y.right.parent = x;
        }
        y.parent = x.parent;
        if (x.parent === null) {
            this.root = y;
        } else if (x === x.parent.right) {
            x.parent.right = y;
        } else {
            x.parent.left = y;
        }
        y.right = x;
        x.parent = y;
    }
}

class Heap {
    constructor(compareFn = (a, b) => a - b) {
        this.items = [];
        this.compare = compareFn;
    }

    size() {
        return this.items.length;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    peek() {
        return this.items[0];
    }

    parent(index) {
        return Math.floor((index - 1) / 2);
    }

    leftChild(index) {
        return 2 * index + 1;
    }

    rightChild(index) {
        return 2 * index + 2;
    }

    swap(index1, index2) {
        [this.items[index1], this.items[index2]] = [this.items[index2], this.items[index1]];
    }

    insert(item) {
        this.items.push(item);
        this.heapifyUp(this.items.length - 1);
    }

    heapifyUp(index) {
        const parentIndex = this.parent(index);
        if (parentIndex >= 0 && this.compare(this.items[index], this.items[parentIndex]) < 0) {
            this.swap(index, parentIndex);
            this.heapifyUp(parentIndex);
        }
    }

    extract() {
        if (this.isEmpty()) return null;

        const item = this.items[0];
        this.items[0] = this.items[this.items.length - 1];
        this.items.pop();

        if (!this.isEmpty()) {
            this.heapifyDown(0);
        }

        return item;
    }

    heapifyDown(index) {
        const leftIndex = this.leftChild(index);
        const rightIndex = this.rightChild(index);
        let smallest = index;

        if (leftIndex < this.items.length &&
            this.compare(this.items[leftIndex], this.items[smallest]) < 0) {
            smallest = leftIndex;
        }

        if (rightIndex < this.items.length &&
            this.compare(this.items[rightIndex], this.items[smallest]) < 0) {
            smallest = rightIndex;
        }

        if (smallest !== index) {
            this.swap(index, smallest);
            this.heapifyDown(smallest);
        }
    }
}

class Graph {
    constructor(directed = false) {
        this.nodes = new Map();
        this.directed = directed;
    }

    addNode(value) {
        if (!this.nodes.has(value)) {
            this.nodes.set(value, new GraphNode(value));
        }
        return this.nodes.get(value);
    }

    addEdge(from, to, weight = 1) {
        const fromNode = this.addNode(from);
        const toNode = this.addNode(to);

        fromNode.addEdge(toNode, weight);

        if (!this.directed) {
            toNode.addEdge(fromNode, weight);
        }
    }

    removeNode(value) {
        const node = this.nodes.get(value);
        if (!node) return false;

        for (let otherNode of this.nodes.values()) {
            otherNode.removeEdge(node);
        }

        this.nodes.delete(value);
        return true;
    }

    breadthFirstSearch(startValue, targetValue) {
        const startNode = this.nodes.get(startValue);
        if (!startNode) return null;

        const queue = [startNode];
        const visited = new Set();
        const path = [];

        while (queue.length > 0) {
            const current = queue.shift();

            if (visited.has(current)) continue;
            visited.add(current);
            path.push(current.value);

            if (current.value === targetValue) {
                return path;
            }

            for (let edge of current.adjacent) {
                if (!visited.has(edge.node)) {
                    queue.push(edge.node);
                }
            }
        }

        return null;
    }

    depthFirstSearch(startValue, targetValue) {
        const startNode = this.nodes.get(startValue);
        if (!startNode) return null;

        const stack = [startNode];
        const visited = new Set();
        const path = [];

        while (stack.length > 0) {
            const current = stack.pop();

            if (visited.has(current)) continue;
            visited.add(current);
            path.push(current.value);

            if (current.value === targetValue) {
                return path;
            }

            for (let edge of current.adjacent) {
                if (!visited.has(edge.node)) {
                    stack.push(edge.node);
                }
            }
        }

        return null;
    }

    dijkstra(startValue) {
        const startNode = this.nodes.get(startValue);
        if (!startNode) return null;

        for (let node of this.nodes.values()) {
            node.distance = Infinity;
            node.previous = null;
        }

        startNode.distance = 0;
        const unvisited = new Set(this.nodes.values());
        const heap = new Heap((a, b) => a.distance - b.distance);

        heap.insert(startNode);

        while (!heap.isEmpty()) {
            const current = heap.extract();

            if (!unvisited.has(current)) continue;
            unvisited.delete(current);

            for (let edge of current.adjacent) {
                const neighbor = edge.node;
                const newDistance = current.distance + edge.weight;

                if (newDistance < neighbor.distance) {
                    neighbor.distance = newDistance;
                    neighbor.previous = current;
                    heap.insert(neighbor);
                }
            }
        }

        const distances = {};
        for (let [value, node] of this.nodes) {
            distances[value] = node.distance;
        }

        return distances;
    }

    topologicalSort() {
        if (!this.directed) {
            throw new Error('Topological sort is only valid for directed graphs');
        }

        const inDegree = new Map();
        const queue = [];
        const result = [];

        for (let [value, node] of this.nodes) {
            inDegree.set(value, node.inDegree);
            if (node.inDegree === 0) {
                queue.push(node);
            }
        }

        while (queue.length > 0) {
            const current = queue.shift();
            result.push(current.value);

            for (let edge of current.adjacent) {
                const neighbor = edge.node;
                const newInDegree = inDegree.get(neighbor.value) - 1;
                inDegree.set(neighbor.value, newInDegree);

                if (newInDegree === 0) {
                    queue.push(neighbor);
                }
            }
        }

        if (result.length !== this.nodes.size) {
            throw new Error('Graph contains a cycle');
        }

        return result;
    }

    detectCycle() {
        if (!this.directed) {
            return this.detectCycleUndirected();
        } else {
            return this.detectCycleDirected();
        }
    }

    detectCycleUndirected() {
        const visited = new Set();

        for (let node of this.nodes.values()) {
            if (!visited.has(node)) {
                if (this.dfsUndirectedCycle(node, null, visited)) {
                    return true;
                }
            }
        }

        return false;
    }

    dfsUndirectedCycle(node, parent, visited) {
        visited.add(node);

        for (let edge of node.adjacent) {
            const neighbor = edge.node;

            if (!visited.has(neighbor)) {
                if (this.dfsUndirectedCycle(neighbor, node, visited)) {
                    return true;
                }
            } else if (neighbor !== parent) {
                return true;
            }
        }

        return false;
    }

    detectCycleDirected() {
        const WHITE = 0, GRAY = 1, BLACK = 2;
        const colors = new Map();

        for (let node of this.nodes.values()) {
            colors.set(node, WHITE);
        }

        for (let node of this.nodes.values()) {
            if (colors.get(node) === WHITE) {
                if (this.dfsDirectedCycle(node, colors)) {
                    return true;
                }
            }
        }

        return false;
    }

    dfsDirectedCycle(node, colors) {
        colors.set(node, 1);

        for (let edge of node.adjacent) {
            const neighbor = edge.node;
            const color = colors.get(neighbor);

            if (color === 1) {
                return true;
            }

            if (color === 0 && this.dfsDirectedCycle(neighbor, colors)) {
                return true;
            }
        }

        colors.set(node, 2);
        return false;
    }
}

class SortingAlgorithms {
    static quickSort(arr, left = 0, right = arr.length - 1) {
        if (left < right) {
            const pivotIndex = this.partition(arr, left, right);
            this.quickSort(arr, left, pivotIndex - 1);
            this.quickSort(arr, pivotIndex + 1, right);
        }
        return arr;
    }

    static partition(arr, left, right) {
        const pivot = arr[right];
        let i = left - 1;

        for (let j = left; j < right; j++) {
            if (arr[j] <= pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }

        [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
        return i + 1;
    }

    static mergeSort(arr) {
        if (arr.length <= 1) return arr;

        const mid = Math.floor(arr.length / 2);
        const left = this.mergeSort(arr.slice(0, mid));
        const right = this.mergeSort(arr.slice(mid));

        return this.merge(left, right);
    }

    static merge(left, right) {
        const result = [];
        let leftIndex = 0;
        let rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length) {
            if (left[leftIndex] <= right[rightIndex]) {
                result.push(left[leftIndex]);
                leftIndex++;
            } else {
                result.push(right[rightIndex]);
                rightIndex++;
            }
        }

        return result.concat(left.slice(leftIndex), right.slice(rightIndex));
    }

    static heapSort(arr) {
        const n = arr.length;

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            this.heapify(arr, n, i);
        }

        for (let i = n - 1; i > 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]];
            this.heapify(arr, i, 0);
        }

        return arr;
    }

    static heapify(arr, n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }

        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            this.heapify(arr, n, largest);
        }
    }

    static radixSort(arr) {
        const max = Math.max(...arr);
        const maxDigits = Math.floor(Math.log10(max)) + 1;

        for (let digit = 0; digit < maxDigits; digit++) {
            const buckets = Array.from({ length: 10 }, () => []);

            for (let num of arr) {
                const digitValue = Math.floor(num / Math.pow(10, digit)) % 10;
                buckets[digitValue].push(num);
            }

            arr.splice(0, arr.length, ...buckets.flat());
        }

        return arr;
    }

    static countingSort(arr) {
        const max = Math.max(...arr);
        const count = new Array(max + 1).fill(0);
        const output = new Array(arr.length);

        for (let num of arr) {
            count[num]++;
        }

        for (let i = 1; i <= max; i++) {
            count[i] += count[i - 1];
        }

        for (let i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i]] - 1] = arr[i];
            count[arr[i]]--;
        }

        return output;
    }

    static bucketSort(arr, bucketSize = 5) {
        if (arr.length === 0) return arr;

        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const bucketCount = Math.floor((max - min) / bucketSize) + 1;
        const buckets = Array.from({ length: bucketCount }, () => []);

        for (let num of arr) {
            const bucketIndex = Math.floor((num - min) / bucketSize);
            buckets[bucketIndex].push(num);
        }

        const sorted = [];
        for (let bucket of buckets) {
            if (bucket.length > 0) {
                bucket.sort((a, b) => a - b);
                sorted.push(...bucket);
            }
        }

        return sorted;
    }

    static timSort(arr) {
        const MIN_MERGE = 32;

        function getMinRunLength(n) {
            let r = 0;
            while (n >= MIN_MERGE) {
                r |= n & 1;
                n >>= 1;
            }
            return n + r;
        }

        function insertionSort(arr, left, right) {
            for (let i = left + 1; i <= right; i++) {
                const keyItem = arr[i];
                let j = i - 1;
                while (j >= left && arr[j] > keyItem) {
                    arr[j + 1] = arr[j];
                    j--;
                }
                arr[j + 1] = keyItem;
            }
        }

        function merge(arr, left, mid, right) {
            const leftPart = arr.slice(left, mid + 1);
            const rightPart = arr.slice(mid + 1, right + 1);

            let i = 0, j = 0, k = left;

            while (i < leftPart.length && j < rightPart.length) {
                if (leftPart[i] <= rightPart[j]) {
                    arr[k] = leftPart[i];
                    i++;
                } else {
                    arr[k] = rightPart[j];
                    j++;
                }
                k++;
            }

            while (i < leftPart.length) {
                arr[k] = leftPart[i];
                i++;
                k++;
            }

            while (j < rightPart.length) {
                arr[k] = rightPart[j];
                j++;
                k++;
            }
        }

        const n = arr.length;
        const minRun = getMinRunLength(n);

        for (let start = 0; start < n; start += minRun) {
            const end = Math.min(start + minRun - 1, n - 1);
            insertionSort(arr, start, end);
        }

        let size = minRun;
        while (size < n) {
            for (let start = 0; start < n; start += size * 2) {
                const mid = start + size - 1;
                const end = Math.min(start + size * 2 - 1, n - 1);

                if (mid < end) {
                    merge(arr, start, mid, end);
                }
            }
            size *= 2;
        }

        return arr;
    }
}

class SearchAlgorithms {
    static binarySearch(arr, target) {
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);

            if (arr[mid] === target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return -1;
    }

    static interpolationSearch(arr, target) {
        let left = 0;
        let right = arr.length - 1;

        while (left <= right && target >= arr[left] && target <= arr[right]) {
            if (left === right) {
                return arr[left] === target ? left : -1;
            }

            const pos = left + Math.floor(
                ((target - arr[left]) / (arr[right] - arr[left])) * (right - left)
            );

            if (arr[pos] === target) {
                return pos;
            } else if (arr[pos] < target) {
                left = pos + 1;
            } else {
                right = pos - 1;
            }
        }

        return -1;
    }

    static exponentialSearch(arr, target) {
        if (arr[0] === target) return 0;

        let i = 1;
        while (i < arr.length && arr[i] <= target) {
            i *= 2;
        }

        const left = i / 2;
        const right = Math.min(i, arr.length - 1);

        return this.binarySearchRange(arr, target, left, right);
    }

    static binarySearchRange(arr, target, left, right) {
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);

            if (arr[mid] === target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return -1;
    }

    static jumpSearch(arr, target) {
        const n = arr.length;
        const step = Math.floor(Math.sqrt(n));
        let prev = 0;

        while (arr[Math.min(step, n) - 1] < target) {
            prev = step;
            step += Math.floor(Math.sqrt(n));
            if (prev >= n) return -1;
        }

        while (arr[prev] < target) {
            prev++;
            if (prev === Math.min(step, n)) return -1;
        }

        return arr[prev] === target ? prev : -1;
    }

    static ternarySearch(arr, target, left = 0, right = arr.length - 1) {
        if (right >= left) {
            const mid1 = left + Math.floor((right - left) / 3);
            const mid2 = right - Math.floor((right - left) / 3);

            if (arr[mid1] === target) return mid1;
            if (arr[mid2] === target) return mid2;

            if (target < arr[mid1]) {
                return this.ternarySearch(arr, target, left, mid1 - 1);
            } else if (target > arr[mid2]) {
                return this.ternarySearch(arr, target, mid2 + 1, right);
            } else {
                return this.ternarySearch(arr, target, mid1 + 1, mid2 - 1);
            }
        }

        return -1;
    }
}

class StringAlgorithms {
    static kmpSearch(text, pattern) {
        const lps = this.computeLPS(pattern);
        const results = [];
        let i = 0;
        let j = 0;

        while (i < text.length) {
            if (pattern[j] === text[i]) {
                i++;
                j++;
            }

            if (j === pattern.length) {
                results.push(i - j);
                j = lps[j - 1];
            } else if (i < text.length && pattern[j] !== text[i]) {
                if (j !== 0) {
                    j = lps[j - 1];
                } else {
                    i++;
                }
            }
        }

        return results;
    }

    static computeLPS(pattern) {
        const lps = new Array(pattern.length).fill(0);
        let len = 0;
        let i = 1;

        while (i < pattern.length) {
            if (pattern[i] === pattern[len]) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if (len !== 0) {
                    len = lps[len - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }

        return lps;
    }

    static rabinKarpSearch(text, pattern) {
        const prime = 101;
        const patternLength = pattern.length;
        const textLength = text.length;
        const results = [];

        let patternHash = 0;
        let textHash = 0;
        let h = 1;

        for (let i = 0; i < patternLength - 1; i++) {
            h = (h * 256) % prime;
        }

        for (let i = 0; i < patternLength; i++) {
            patternHash = (256 * patternHash + pattern.charCodeAt(i)) % prime;
            textHash = (256 * textHash + text.charCodeAt(i)) % prime;
        }

        for (let i = 0; i <= textLength - patternLength; i++) {
            if (patternHash === textHash) {
                let j;
                for (j = 0; j < patternLength; j++) {
                    if (text[i + j] !== pattern[j]) break;
                }
                if (j === patternLength) {
                    results.push(i);
                }
            }

            if (i < textLength - patternLength) {
                textHash = (256 * (textHash - text.charCodeAt(i) * h) + text.charCodeAt(i + patternLength)) % prime;
                if (textHash < 0) textHash += prime;
            }
        }

        return results;
    }

    static boyerMooreSearch(text, pattern) {
        const badCharTable = this.buildBadCharTable(pattern);
        const results = [];
        let shift = 0;

        while (shift <= text.length - pattern.length) {
            let j = pattern.length - 1;

            while (j >= 0 && pattern[j] === text[shift + j]) {
                j--;
            }

            if (j < 0) {
                results.push(shift);
                shift += shift + pattern.length < text.length
                    ? pattern.length - badCharTable[text.charCodeAt(shift + pattern.length)] || pattern.length
                    : 1;
            } else {
                shift += Math.max(1, j - (badCharTable[text.charCodeAt(shift + j)] || -1));
            }
        }

        return results;
    }

    static buildBadCharTable(pattern) {
        const table = {};
        for (let i = 0; i < pattern.length; i++) {
            table[pattern.charCodeAt(i)] = i;
        }
        return table;
    }

    static longestCommonSubsequence(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        let lcs = '';
        let i = m, j = n;
        while (i > 0 && j > 0) {
            if (str1[i - 1] === str2[j - 1]) {
                lcs = str1[i - 1] + lcs;
                i--;
                j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        return { length: dp[m][n], sequence: lcs };
    }

    static editDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(
                        dp[i - 1][j],
                        dp[i][j - 1],
                        dp[i - 1][j - 1]
                    );
                }
            }
        }

        return dp[m][n];
    }
}

function demonstrateAlgorithms() {
    console.log('Advanced Algorithms and Data Structures Demo');
    console.log('===========================================');

    console.log('\n1. AVL Tree Operations:');
    console.log('-----------------------');
    const avlTree = new AVLTree();
    const values = [10, 20, 30, 40, 50, 25];

    values.forEach(val => {
        avlTree.insert(val);
        console.log(`Inserted ${val}, tree size: ${avlTree.size}`);
    });

    console.log('In-order traversal:', avlTree.inOrder());
    console.log('Search for 25:', avlTree.search(25) ? 'Found' : 'Not found');

    console.log('\n2. Graph Algorithms:');
    console.log('-------------------');
    const graph = new Graph(true);

    ['A', 'B', 'C', 'D', 'E'].forEach(node => graph.addNode(node));

    graph.addEdge('A', 'B', 4);
    graph.addEdge('A', 'C', 2);
    graph.addEdge('B', 'C', 1);
    graph.addEdge('B', 'D', 5);
    graph.addEdge('C', 'D', 8);
    graph.addEdge('C', 'E', 10);
    graph.addEdge('D', 'E', 2);

    console.log('BFS from A to E:', graph.breadthFirstSearch('A', 'E'));
    console.log('DFS from A to E:', graph.depthFirstSearch('A', 'E'));

    const distances = graph.dijkstra('A');
    console.log('Shortest distances from A:', distances);

    console.log('Topological sort:', graph.topologicalSort());
    console.log('Has cycle:', graph.detectCycle());

    console.log('\n3. Sorting Algorithms:');
    console.log('---------------------');
    const testArray = [64, 34, 25, 12, 22, 11, 90];

    console.log('Original array:', testArray);
    console.log('Quick sort:', SortingAlgorithms.quickSort([...testArray]));
    console.log('Merge sort:', SortingAlgorithms.mergeSort([...testArray]));
    console.log('Heap sort:', SortingAlgorithms.heapSort([...testArray]));
    console.log('Radix sort:', SortingAlgorithms.radixSort([...testArray]));
    console.log('Counting sort:', SortingAlgorithms.countingSort([...testArray]));
    console.log('Bucket sort:', SortingAlgorithms.bucketSort([...testArray]));
    console.log('Tim sort:', SortingAlgorithms.timSort([...testArray]));

    console.log('\n4. Search Algorithms:');
    console.log('--------------------');
    const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const target = 7;

    console.log('Sorted array:', sortedArray);
    console.log(`Searching for ${target}:`);
    console.log('Binary search:', SearchAlgorithms.binarySearch(sortedArray, target));
    console.log('Interpolation search:', SearchAlgorithms.interpolationSearch(sortedArray, target));
    console.log('Exponential search:', SearchAlgorithms.exponentialSearch(sortedArray, target));
    console.log('Jump search:', SearchAlgorithms.jumpSearch(sortedArray, target));
    console.log('Ternary search:', SearchAlgorithms.ternarySearch(sortedArray, target));

    console.log('\n5. String Algorithms:');
    console.log('--------------------');
    const text = "ABABDABACDABABCABCABCABCABC";
    const pattern = "ABABCABCAB";

    console.log(`Text: ${text}`);
    console.log(`Pattern: ${pattern}`);
    console.log('KMP search:', StringAlgorithms.kmpSearch(text, pattern));
    console.log('Rabin-Karp search:', StringAlgorithms.rabinKarpSearch(text, pattern));
    console.log('Boyer-Moore search:', StringAlgorithms.boyerMooreSearch(text, pattern));

    const str1 = "AGGTAB";
    const str2 = "GXTXAYB";
    console.log(`\nLCS of "${str1}" and "${str2}":`, StringAlgorithms.longestCommonSubsequence(str1, str2));
    console.log(`Edit distance between "${str1}" and "${str2}":`, StringAlgorithms.editDistance(str1, str2));

    console.log('\n6. Heap Operations:');
    console.log('------------------');
    const minHeap = new Heap();
    const heapValues = [4, 7, 2, 9, 1, 5, 3];

    heapValues.forEach(val => {
        minHeap.insert(val);
        console.log(`Inserted ${val}, heap size: ${minHeap.size()}`);
    });

    console.log('Extracting elements from min heap:');
    while (!minHeap.isEmpty()) {
        console.log('Extracted:', minHeap.extract());
    }

    console.log('\n7. Red-Black Tree:');
    console.log('-----------------');
    const rbTree = new RedBlackTree();
    const rbValues = [7, 3, 18, 10, 22, 8, 11, 26];

    rbValues.forEach(val => {
        rbTree.insert(val);
        console.log(`Inserted ${val} into Red-Black tree`);
    });

    console.log('\nAlgorithm demonstration completed!');
}

if (require.main === module) {
    demonstrateAlgorithms();
}

module.exports = {
    Node,
    TreeNode,
    GraphNode,
    AVLTree,
    RedBlackTree,
    Heap,
    Graph,
    SortingAlgorithms,
    SearchAlgorithms,
    StringAlgorithms
};