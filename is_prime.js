// PROMPT:
// 
// Generate a JavaScript function that checks if a number is prime. Write it
// to a file that I can run with node.js. Include this prompt as a comment at
// the top of the file.
// 

function isPrime(n) {
    /**
     * Checks if a number is prime.
     *
     * @param {number} n - The number to check
     * @returns {boolean} - True if the number is prime, false otherwise
     */
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}

// Example usage
const testNumbers = [1, 2, 3, 4, 5, 17, 20, 29, 100, 97];
console.log("Prime number checks:");
testNumbers.forEach(num => {
    console.log(`${num}: ${isPrime(num) ? "prime" : "not prime"}`);
});
