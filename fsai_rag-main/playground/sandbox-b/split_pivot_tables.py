import os
import re

import pandas as pd


def read_and_format_pivot(file_name, sheet_name):
    """
    Read and format a wide pivot table structure
    """
    # Read the Excel file with first row as header
    df = pd.read_excel(
        file_name,
        sheet_name=sheet_name,
    )

    # Drop any completely empty rows and columns
    df = df.dropna(how="all", axis=0)
    df = df.dropna(how="all", axis=1)

    # Format numbers to have commas and dollar signs
    numeric_columns = df.select_dtypes(include=["float64", "int64"]).columns
    for col in numeric_columns:
        df[col] = df[col].apply(lambda x: f"${x:,.0f}" if pd.notnull(x) else "")

    return df


def clean_text_file(file_path):
    """
    Remove unnamed columns and clean up the text file
    """
    with open(file_path, "r") as f:
        lines = f.readlines()

    # Remove lines containing "Unnamed:"
    cleaned_lines = [line for line in lines if not "Unnamed:" in line]

    # Write back to file
    with open(file_path, "w") as f:
        f.writelines(cleaned_lines)


def format_output(df):
    """
    Format the DataFrame into aligned text with proper spacing
    """
    # Convert all values to strings and handle NaN
    df = df.fillna("")
    df = df.astype(str)

    # Get maximum width for each column (including header)
    col_widths = {
        col: max(len(str(col)), df[col].str.len().max()) for col in df.columns
    }

    # Format header
    header = "  ".join(str(col).ljust(col_widths[col]) for col in df.columns)

    # Format rows
    rows = []
    for _, row in df.iterrows():
        formatted_row = "  ".join(
            str(val).ljust(col_widths[col]) for col, val in row.items()
        )
        rows.append(formatted_row)

    return header + "\n" + "\n".join(rows)


def main(file_name) -> list[str]:
    # Read all sheets
    xl = pd.ExcelFile(file_name)
    sheet_names = xl.sheet_names
    print("Processing sheets:", sheet_names)

    # Filter out "Source data" sheet
    sheet_names = [sheet for sheet in sheet_names if sheet.lower() != "source data"]
    print("Processing pivot sheets:", sheet_names)

    output_files = []
    dir_name = os.path.dirname(file_name)
    output_dir = os.path.join(dir_name, "TXT")
    os.makedirs(output_dir, exist_ok=True)

    for sheet_name in sheet_names:
        try:
            # Read and format the pivot table
            df = read_and_format_pivot(file_name, sheet_name)
            formatted_text = format_output(df)

            # Save to file
            base_name = os.path.splitext(os.path.basename(file_name))[0]
            output_file = os.path.join(output_dir, f"{base_name}_{sheet_name}.txt")

            with open(output_file, "w") as f:
                f.write(formatted_text)

            # Clean up the text file
            clean_text_file(output_file)

            output_files.append(output_file)
            print(f"Saved sheet '{sheet_name}' to {output_file}")

        except Exception as e:
            print(f"Could not process sheet '{sheet_name}': {str(e)}")
            continue

    return output_files


if __name__ == "__main__":
    excel_file = "data/b4si/xlsx/Benchmark sample provisional database - BH pivots.xlsx"

    try:
        output_files = main(excel_file)
        print("Successfully processed files:", output_files)
    except Exception as e:
        print(f"Error: {e}")
