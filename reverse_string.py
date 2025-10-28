# PROMPT:
# 
# Write a function in Python that reverses a string. Write it to a file that
# I can run. Include this prompt as a comment at the top of the file.
# 

def reverse_string(s):
    """
    Reverses a string.

    Args:
        s (str): The string to reverse

    Returns:
        str: The reversed string
    """
    return s[::-1]


if __name__ == "__main__":
    # Example usage
    test_string = "Hello, World!"
    reversed_string = reverse_string(test_string)
    print(f"Original: {test_string}")
    print(f"Reversed: {reversed_string}")
