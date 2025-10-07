class AdvancedCalculator {
    constructor() {
        this.history = [];
        this.memory = 0;
        this.precision = 10;
        this.constants = {
            PI: 3.141592653589793,
            E: 2.718281828459045,
            GOLDEN_RATIO: 1.618033988749895
        };
    }

    add(a, b) {
        const result = parseFloat((a + b).toFixed(this.precision));
        this.history.push(`${a} + ${b} = ${result}`);
        return result;
    }

    subtract(a, b) {
        const result = parseFloat((a - b).toFixed(this.precision));
        this.history.push(`${a} - ${b} = ${result}`);
        return result;
    }

    multiply(a, b) {
        const result = parseFloat((a * b).toFixed(this.precision));
        this.history.push(`${a} * ${b} = ${result}`);
        return result;
    }

    divide(a, b) {
        if (b === 0) {
            throw new Error('Division by zero is not allowed');
        }
        const result = parseFloat((a / b).toFixed(this.precision));
        this.history.push(`${a} / ${b} = ${result}`);
        return result;
    }

    power(base, exponent) {
        const result = parseFloat(Math.pow(base, exponent).toFixed(this.precision));
        this.history.push(`${base} ^ ${exponent} = ${result}`);
        return result;
    }

    sqrt(number) {
        if (number < 0) {
            throw new Error('Cannot calculate square root of negative number');
        }
        const result = parseFloat(Math.sqrt(number).toFixed(this.precision));
        this.history.push(`${number} = ${result}`);
        return result;
    }

    factorial(n) {
        if (n < 0 || !Number.isInteger(n)) {
            throw new Error('Factorial is only defined for non-negative integers');
        }
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        this.history.push(`${n}! = ${result}`);
        return result;
    }

    fibonacci(n) {
        if (n < 0 || !Number.isInteger(n)) {
            throw new Error('Fibonacci is only defined for non-negative integers');
        }
        if (n <= 1) return n;

        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
            [a, b] = [b, a + b];
        }
        this.history.push(`fib(${n}) = ${b}`);
        return b;
    }

    sine(angle, degrees = true) {
        const radians = degrees ? angle * (Math.PI / 180) : angle;
        const result = parseFloat(Math.sin(radians).toFixed(this.precision));
        this.history.push(`sin(${angle}${degrees ? '°' : ' rad'}) = ${result}`);
        return result;
    }

    cosine(angle, degrees = true) {
        const radians = degrees ? angle * (Math.PI / 180) : angle;
        const result = parseFloat(Math.cos(radians).toFixed(this.precision));
        this.history.push(`cos(${angle}${degrees ? '°' : ' rad'}) = ${result}`);
        return result;
    }

    tangent(angle, degrees = true) {
        const radians = degrees ? angle * (Math.PI / 180) : angle;
        const result = parseFloat(Math.tan(radians).toFixed(this.precision));
        this.history.push(`tan(${angle}${degrees ? '°' : ' rad'}) = ${result}`);
        return result;
    }

    logarithm(number, base = Math.E) {
        if (number <= 0) {
            throw new Error('Logarithm is only defined for positive numbers');
        }
        const result = parseFloat((Math.log(number) / Math.log(base)).toFixed(this.precision));
        this.history.push(`log${base === Math.E ? '' : '_' + base}(${number}) = ${result}`);
        return result;
    }

    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        this.history.push(`gcd(${arguments[0]}, ${arguments[1]}) = ${a}`);
        return a;
    }

    lcm(a, b) {
        const result = Math.abs(a * b) / this.gcd(a, b);
        this.history.push(`lcm(${a}, ${b}) = ${result}`);
        return result;
    }

    isPrime(n) {
        if (n < 2 || !Number.isInteger(n)) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;

        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0) return false;
        }
        this.history.push(`isPrime(${n}) = true`);
        return true;
    }

    generatePrimes(limit) {
        const primes = [];
        const sieve = new Array(limit + 1).fill(true);
        sieve[0] = sieve[1] = false;

        for (let i = 2; i <= Math.sqrt(limit); i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= limit; j += i) {
                    sieve[j] = false;
                }
            }
        }

        for (let i = 2; i <= limit; i++) {
            if (sieve[i]) primes.push(i);
        }

        this.history.push(`Generated ${primes.length} primes up to ${limit}`);
        return primes;
    }

    quadraticSolver(a, b, c) {
        if (a === 0) {
            throw new Error('Coefficient a cannot be zero in quadratic equation');
        }

        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            const realPart = parseFloat((-b / (2 * a)).toFixed(this.precision));
            const imaginaryPart = parseFloat((Math.sqrt(-discriminant) / (2 * a)).toFixed(this.precision));
            const result = {
                x1: `${realPart} + ${imaginaryPart}i`,
                x2: `${realPart} - ${imaginaryPart}i`
            };
            this.history.push(`Quadratic ${a}x² + ${b}x + ${c} = 0 has complex roots`);
            return result;
        } else if (discriminant === 0) {
            const x = parseFloat((-b / (2 * a)).toFixed(this.precision));
            this.history.push(`Quadratic ${a}x² + ${b}x + ${c} = 0 has double root x = ${x}`);
            return { x1: x, x2: x };
        } else {
            const x1 = parseFloat(((-b + Math.sqrt(discriminant)) / (2 * a)).toFixed(this.precision));
            const x2 = parseFloat(((-b - Math.sqrt(discriminant)) / (2 * a)).toFixed(this.precision));
            this.history.push(`Quadratic ${a}x² + ${b}x + ${c} = 0 has roots x1 = ${x1}, x2 = ${x2}`);
            return { x1, x2 };
        }
    }

    memoryStore(value) {
        this.memory = value;
        this.history.push(`Memory stored: ${value}`);
    }

    memoryRecall() {
        this.history.push(`Memory recalled: ${this.memory}`);
        return this.memory;
    }

    memoryClear() {
        this.memory = 0;
        this.history.push('Memory cleared');
    }

    memoryAdd(value) {
        this.memory += value;
        this.history.push(`Memory added: ${value}, new total: ${this.memory}`);
    }

    statistics(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            throw new Error('Input must be a non-empty array of numbers');
        }

        const n = numbers.length;
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        const mean = sum / n;

        const sortedNumbers = [...numbers].sort((a, b) => a - b);
        const median = n % 2 === 0
            ? (sortedNumbers[n / 2 - 1] + sortedNumbers[n / 2]) / 2
            : sortedNumbers[Math.floor(n / 2)];

        const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / n;
        const standardDeviation = Math.sqrt(variance);

        const mode = this.calculateMode(numbers);

        const stats = {
            count: n,
            sum: parseFloat(sum.toFixed(this.precision)),
            mean: parseFloat(mean.toFixed(this.precision)),
            median: parseFloat(median.toFixed(this.precision)),
            mode: mode,
            variance: parseFloat(variance.toFixed(this.precision)),
            standardDeviation: parseFloat(standardDeviation.toFixed(this.precision)),
            min: Math.min(...numbers),
            max: Math.max(...numbers)
        };

        this.history.push(`Statistics calculated for ${n} numbers`);
        return stats;
    }

    calculateMode(numbers) {
        const frequency = {};
        let maxFreq = 0;

        numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
            maxFreq = Math.max(maxFreq, frequency[num]);
        });

        const modes = Object.keys(frequency)
            .filter(key => frequency[key] === maxFreq)
            .map(Number);

        return modes.length === numbers.length ? null : modes;
    }

    matrixMultiply(matrixA, matrixB) {
        if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
            throw new Error('Both inputs must be arrays (matrices)');
        }

        const rowsA = matrixA.length;
        const colsA = matrixA[0].length;
        const rowsB = matrixB.length;
        const colsB = matrixB[0].length;

        if (colsA !== rowsB) {
            throw new Error('Matrix dimensions are incompatible for multiplication');
        }

        const result = Array(rowsA).fill().map(() => Array(colsB).fill(0));

        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                for (let k = 0; k < colsA; k++) {
                    result[i][j] += matrixA[i][k] * matrixB[k][j];
                }
                result[i][j] = parseFloat(result[i][j].toFixed(this.precision));
            }
        }

        this.history.push(`Matrix multiplication: ${rowsA}x${colsA} * ${rowsB}x${colsB}`);
        return result;
    }

    convertBase(number, fromBase, toBase) {
        if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
            throw new Error('Base must be between 2 and 36');
        }

        const decimal = parseInt(number.toString(), fromBase);
        const result = decimal.toString(toBase).toUpperCase();

        this.history.push(`Base conversion: ${number} (base ${fromBase}) = ${result} (base ${toBase})`);
        return result;
    }

    clearHistory() {
        this.history = [];
    }

    getHistory() {
        return [...this.history];
    }

    setPrecision(precision) {
        if (precision < 0 || precision > 20) {
            throw new Error('Precision must be between 0 and 20');
        }
        this.precision = precision;
        this.history.push(`Precision set to ${precision} decimal places`);
    }
}

function runCalculatorDemo() {
    const calc = new AdvancedCalculator();

    console.log('Advanced Calculator Demo');
    console.log('========================');

    try {
        console.log('Basic operations:');
        console.log('5 + 3 =', calc.add(5, 3));
        console.log('10 - 4 =', calc.subtract(10, 4));
        console.log('6 * 7 =', calc.multiply(6, 7));
        console.log('15 / 3 =', calc.divide(15, 3));

        console.log('\nAdvanced operations:');
        console.log('2^8 =', calc.power(2, 8));
        console.log('16 =', calc.sqrt(16));
        console.log('5! =', calc.factorial(5));
        console.log('fib(10) =', calc.fibonacci(10));

        console.log('\nTrigonometric functions:');
        console.log('sin(30°) =', calc.sine(30));
        console.log('cos(60°) =', calc.cosine(60));
        console.log('tan(45°) =', calc.tangent(45));

        console.log('\nNumber theory:');
        console.log('gcd(48, 18) =', calc.gcd(48, 18));
        console.log('lcm(12, 15) =', calc.lcm(12, 15));
        console.log('isPrime(17) =', calc.isPrime(17));

        console.log('\nQuadratic equation solver:');
        console.log('x² - 5x + 6 = 0:', calc.quadraticSolver(1, -5, 6));

        console.log('\nStatistics:');
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        console.log('Data:', data);
        console.log('Stats:', calc.statistics(data));

        console.log('\nMatrix multiplication:');
        const matrixA = [[1, 2], [3, 4]];
        const matrixB = [[5, 6], [7, 8]];
        console.log('Matrix A:', matrixA);
        console.log('Matrix B:', matrixB);
        console.log('A * B =', calc.matrixMultiply(matrixA, matrixB));

        console.log('\nBase conversion:');
        console.log('255 (decimal) to binary:', calc.convertBase(255, 10, 2));
        console.log('FF (hex) to decimal:', calc.convertBase('FF', 16, 10));

        console.log('\nCalculation history:');
        calc.getHistory().forEach((entry, index) => {
            console.log(`${index + 1}. ${entry}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedCalculator;
} else {
    runCalculatorDemo();
}