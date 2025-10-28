# PROMPT:
#
# Write a function in Python that uses a loop to print "Hello, World!" five
# times and includes a waving emoji in the message. Write it to a file that I
# can run.
#
# Now, write another function in the same file that prints the same message,
# but in five different Indian languages. Use Hindi, Punjabi, Marathi, Bengali
# and any other langauge.
#
# This time, add a third function that does the same thing as the first
# functionm, but uses the library "colorama" to use a different color for each
# hello world message. You pick the colors.
#
# Fix this error: ModuleNotFoundError: No module named 'colorama'
#
# Create a git commit with the generated file with an appropriate commit
# message, and push it to its remote tracking branch.
#

from colorama import Fore, Style, init

def print_hello():
    """
    Prints "Hello, World!" with a waving emoji five times.
    """
    for i in range(5):
        print("Hello, World! 👋")


def print_hello_indian_languages():
    """
    Prints "Hello, World!" in five different Indian languages with a
    waving emoji.
    """
    greetings = [
        "नमस्ते, दुनिया! 👋",  # Hindi
        "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਦੁਨੀਆ! 👋",  # Punjabi
        "नमस्कार, जग! 👋",  # Marathi
        "হ্যালো, বিশ্ব! 👋",  # Bengali
        "வணக்கம், உலகம்! 👋"  # Tamil
    ]
    for greeting in greetings:
        print(greeting)


def print_hello_colorful():
    """
    Prints "Hello, World!" with a waving emoji five times, each in a
    different color using colorama.
    """
    init(autoreset=True)  # Initialize colorama
    colors = [Fore.RED, Fore.GREEN, Fore.YELLOW, Fore.BLUE, Fore.MAGENTA]
    for color in colors:
        print(f"{color}Hello, World! 👋{Style.RESET_ALL}")


if __name__ == "__main__":
    print_hello()
    print()  # Empty line for separation
    print_hello_indian_languages()
    print()  # Empty line for separation
    print_hello_colorful()
