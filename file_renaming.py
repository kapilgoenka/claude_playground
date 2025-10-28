# PROMPT:
#
# Let's work on a new file. Call it file_renaming.py. It should start out by
# creating a folder called "file_renaming_test" and create 20 randomly named
# files it it. Keep roughly equal distribution of file suffixes .txt, .pdf,
# .csv and .png. If the folder already exists, delete and recreate it. Then,
# the script should add the prefix "project_" to all files. Print out a
# message before performing each logical step.
#
# update the file prefix to be today's date in the YYYY_MM_DD_ format.
#
# Update the script to rename the files sequentially as file_1, file_2,
# file_3 etc.
#
# Start the numbering from 100 instead of 1.
#
# modify the script to only rename .txt files
#
# modify it again to rename .txt and .csv files
#
# Modify the script the only print the old and new filenames, without
# actually renaming them. Kind of like a dry run.
#
# add a command line flag to switch betwen dry run and real execution mode
#
# Lets go back to the date-based filex prefixes. This time, also include the
# current time at the second-level granularity.
#
# For the .png files, instead of creating empty files, create actual sample
# images of different resolutions. The resolutions can be small to medium, but
# don't make any two images have exact same resolution.
#
# modify the script to include .png files in renaming, but rename them based
# on their resolution.
#
# At the end, revert all files their their original names.
#

import os
import shutil
import random
import string
import argparse
from datetime import datetime
from PIL import Image, ImageDraw


def generate_random_filename(length=8):
    """
    Generates a random filename with lowercase letters and numbers.
    """
    return ''.join(
        random.choices(string.ascii_lowercase + string.digits, k=length)
    )


def create_test_folder():
    """
    Creates the file_renaming_test folder, deleting it first if it exists.
    """
    folder_name = "file_renaming_test"

    print(f"Checking if folder '{folder_name}' exists...")
    if os.path.exists(folder_name):
        print(f"Folder '{folder_name}' exists. Deleting it...")
        shutil.rmtree(folder_name)
        print(f"Folder '{folder_name}' deleted successfully.")

    print(f"Creating folder '{folder_name}'...")
    os.makedirs(folder_name)
    print(f"Folder '{folder_name}' created successfully.")

    return folder_name


def create_sample_png(filepath, width, height):
    """
    Creates a sample PNG image with random colors and a circle.
    """
    # Generate random background color
    bg_color = (
        random.randint(100, 255),
        random.randint(100, 255),
        random.randint(100, 255)
    )

    # Create image with background color
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Draw a circle in the center
    circle_color = (
        random.randint(0, 150),
        random.randint(0, 150),
        random.randint(0, 150)
    )
    center_x, center_y = width // 2, height // 2
    radius = min(width, height) // 3
    draw.ellipse(
        [
            center_x - radius,
            center_y - radius,
            center_x + radius,
            center_y + radius
        ],
        fill=circle_color
    )

    # Save the image
    img.save(filepath)


def create_random_files(folder_name, num_files=20):
    """
    Creates randomly named files with equal distribution of extensions.
    For PNG files, creates actual images with unique resolutions.
    """
    extensions = ['.txt', '.pdf', '.csv', '.png']

    # Track resolutions used for PNG files
    used_resolutions = set()

    print(f"\nCreating {num_files} randomly named files...")

    for i in range(num_files):
        # Distribute extensions equally
        extension = extensions[i % len(extensions)]
        filename = generate_random_filename() + extension
        filepath = os.path.join(folder_name, filename)

        if extension == '.png':
            # Generate unique resolution for PNG
            while True:
                width = random.randint(100, 500)
                height = random.randint(100, 500)
                resolution = (width, height)
                if resolution not in used_resolutions:
                    used_resolutions.add(resolution)
                    break

            create_sample_png(filepath, width, height)
            print(f"  Created: {filename} ({width}x{height})")
        else:
            # Create empty file for other extensions
            with open(filepath, 'w') as f:
                pass
            print(f"  Created: {filename}")

    print(f"\nSuccessfully created {num_files} files.")


def rename_files_with_timestamp(folder_name, dry_run=True):
    """
    Renames files: timestamp prefix for .txt/.csv, resolution-based for .png.
    Returns a mapping of new filenames to original filenames for reverting.
    """
    # Generate timestamp prefix
    timestamp_prefix = datetime.now().strftime("%Y_%m_%d_%H_%M_%S_")

    if dry_run:
        print(f"\n[DRY RUN] Showing what would be renamed...")
    else:
        print(f"\nRenaming files...")

    files = os.listdir(folder_name)
    all_files = [
        f for f in files if os.path.isfile(os.path.join(folder_name, f))
    ]

    renamed_count = 0
    skipped_count = 0
    rename_mapping = {}  # Maps new filename -> original filename

    for filename in sorted(all_files):
        old_path = os.path.join(folder_name, filename)

        if filename.endswith('.txt') or filename.endswith('.csv'):
            # Add timestamp prefix for .txt and .csv files
            new_filename = timestamp_prefix + filename
            new_path = os.path.join(folder_name, new_filename)

            if dry_run:
                print(f"  Would rename: {filename} -> {new_filename}")
            else:
                os.rename(old_path, new_path)
                rename_mapping[new_filename] = filename
                print(f"  Renamed: {filename} -> {new_filename}")
            renamed_count += 1

        elif filename.endswith('.png'):
            # Rename based on resolution for .png files
            try:
                img = Image.open(old_path)
                width, height = img.size
                img.close()

                new_filename = f"image_{width}x{height}.png"
                new_path = os.path.join(folder_name, new_filename)

                if dry_run:
                    print(
                        f"  Would rename: {filename} -> {new_filename} "
                        f"(resolution: {width}x{height})"
                    )
                else:
                    os.rename(old_path, new_path)
                    rename_mapping[new_filename] = filename
                    print(
                        f"  Renamed: {filename} -> {new_filename} "
                        f"(resolution: {width}x{height})"
                    )
                renamed_count += 1
            except Exception as e:
                print(f"  Error reading {filename}: {e}")
                skipped_count += 1

        else:
            # Skip .pdf files
            skipped_count += 1

    if dry_run:
        print(f"\n[DRY RUN] Would rename {renamed_count} files.")
    else:
        print(f"\nSuccessfully renamed {renamed_count} files.")
    if skipped_count > 0:
        print(f"Skipped {skipped_count} files (.pdf).")

    return rename_mapping


def revert_file_names(folder_name, rename_mapping, dry_run=True):
    """
    Reverts all renamed files back to their original names.
    """
    if dry_run:
        print(f"\n[DRY RUN] Showing what would be reverted...")
    else:
        print(f"\nReverting files to original names...")

    reverted_count = 0

    for new_filename, original_filename in rename_mapping.items():
        new_path = os.path.join(folder_name, new_filename)
        original_path = os.path.join(folder_name, original_filename)

        if os.path.exists(new_path):
            if dry_run:
                print(f"  Would revert: {new_filename} -> {original_filename}")
            else:
                os.rename(new_path, original_path)
                print(f"  Reverted: {new_filename} -> {original_filename}")
            reverted_count += 1

    if dry_run:
        print(f"\n[DRY RUN] Would revert {reverted_count} files.")
    else:
        print(f"\nSuccessfully reverted {reverted_count} files.")


if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='File renaming script with dry run support'
    )
    parser.add_argument(
        '--execute',
        action='store_true',
        help='Execute actual file renaming (default is dry run mode)'
    )
    args = parser.parse_args()

    # Determine if we're in dry run mode
    dry_run = not args.execute

    print("="*88)
    print("FILE RENAMING SCRIPT")
    if dry_run:
        print("[DRY RUN MODE - No files will be renamed]")
    else:
        print("[EXECUTE MODE - Files will be renamed]")
    print("="*88)

    # Create test folder
    folder = create_test_folder()

    # Create random files
    create_random_files(folder, 20)

    # Rename files with timestamp
    rename_mapping = rename_files_with_timestamp(folder, dry_run=dry_run)

    # Revert files back to original names
    revert_file_names(folder, rename_mapping, dry_run=dry_run)

    print("\n" + "="*88)
    print("SCRIPT COMPLETED SUCCESSFULLY")
    print("="*88)
