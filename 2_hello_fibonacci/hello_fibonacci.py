# PROMPT:
#
# Create a new script called helloFibonacci.py and write Python code inside it
# so that when the script is run it prints a Fibonacci series for the number
# that is input to it.
#

def fibonacci(n):
    """Generate Fibonacci series up to n terms."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]

    series = [0, 1]
    for _ in range(2, n):
        series.append(series[-1] + series[-2])
    return series


if __name__ == "__main__":
    num = int(input("Enter the number of Fibonacci terms: "))
    result = fibonacci(num)
    print(f"Fibonacci series: {result}")
