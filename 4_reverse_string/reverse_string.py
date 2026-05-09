# PROMPT:
#
# Write a function in Python that reverses a string. Write it to a file that
# I can run. Include this prompt as a comment at the top of the file.

# Update the code to take the string as input. Also include this prompt at
# the top of the file.
#

def reverse_string(s):
    return s[::-1]


if __name__ == "__main__":
    text = input("Enter a string to reverse: ")
    print(f"Original: {text}")
    print(f"Reversed: {reverse_string(text)}")
