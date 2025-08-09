#!/usr/bin/env python3
"""
SAT Question Parser for Prepify
Parses SAT questions from various sources (PDFs, CSVs, JSON) and converts them to Prepify format.
"""

import json
import csv
import re
import sys
import os
from pathlib import Path
from typing import Dict, List, Any, Optional
import argparse

try:
    import PyPDF2
    import pandas as pd
except ImportError:
    print("❌ Missing required packages. Install with:")
    print("pip install PyPDF2 pandas")
    sys.exit(1)

class SATQuestionParser:
    def __init__(self):
        self.questions = []
        
    def parse_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Parse SAT questions from PDF files (Bluebook format)
        """
        print(f"📖 Parsing PDF: {pdf_path}")
        
        questions = []
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                current_question = {}
                current_text = ""
                
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    current_text += text + "\n"
                    
                    # Look for question patterns
                    question_patterns = [
                        r'Question\s+(\d+)\.?\s*(.*?)(?=Question|\Z)',
                        r'(\d+)\.\s*(.*?)(?=\d+\.|\Z)',
                        r'Problem\s+(\d+)\.?\s*(.*?)(?=Problem|\Z)'
                    ]
                    
                    for pattern in question_patterns:
                        matches = re.finditer(pattern, text, re.DOTALL | re.IGNORECASE)
                        for match in matches:
                            question_num = match.group(1)
                            question_text = match.group(2).strip()
                            
                            # Extract options (A, B, C, D)
                            options = []
                            option_pattern = r'([A-D])[\.\)]\s*(.*?)(?=[A-D][\.\)]|\Z)'
                            option_matches = re.finditer(option_pattern, question_text, re.DOTALL)
                            
                            for opt_match in option_matches:
                                option_letter = opt_match.group(1)
                                option_text = opt_match.group(2).strip()
                                options.append(option_text)
                            
                            # Clean question text (remove options)
                            clean_question = re.sub(r'[A-D][\.\)].*?(?=[A-D][\.\)]|\Z)', '', question_text, flags=re.DOTALL).strip()
                            
                            if clean_question and len(clean_question) > 10:
                                questions.append({
                                    'id': f'pdf-{question_num}',
                                    'question': clean_question,
                                    'options': options,
                                    'correct_answer': '',  # Will need manual review
                                    'explanation': '',
                                    'difficulty': 'M',
                                    'module': 'math',  # Default, will need classification
                                    'source': 'pdf'
                                })
                
                print(f"✅ Extracted {len(questions)} questions from PDF")
                return questions
                
        except Exception as e:
            print(f"❌ Error parsing PDF: {e}")
            return []
    
    def parse_csv(self, csv_path: str) -> List[Dict[str, Any]]:
        """
        Parse SAT questions from CSV files
        """
        print(f"📖 Parsing CSV: {csv_path}")
        
        questions = []
        
        try:
            df = pd.read_csv(csv_path)
            
            # Common column names
            question_cols = ['question', 'content', 'text', 'problem']
            option_cols = ['options', 'choices', 'answers']
            answer_cols = ['correct_answer', 'answer', 'solution']
            difficulty_cols = ['difficulty', 'level']
            module_cols = ['module', 'subject', 'category']
            
            # Find actual column names
            question_col = next((col for col in question_cols if col in df.columns), None)
            options_col = next((col for col in option_cols if col in df.columns), None)
            answer_col = next((col for col in answer_cols if col in df.columns), None)
            difficulty_col = next((col for col in difficulty_cols if col in df.columns), None)
            module_col = next((col for col in module_cols if col in df.columns), None)
            
            if not question_col:
                print("❌ No question column found in CSV")
                return []
            
            for index, row in df.iterrows():
                question_text = str(row[question_col])
                
                # Parse options
                options = []
                if options_col and pd.notna(row[options_col]):
                    if isinstance(row[options_col], str):
                        # Try to parse JSON or comma-separated
                        try:
                            options = json.loads(row[options_col])
                        except:
                            options = [opt.strip() for opt in row[options_col].split(',') if opt.strip()]
                    elif isinstance(row[options_col], list):
                        options = row[options_col]
                
                # Get correct answer
                correct_answer = ""
                if answer_col and pd.notna(row[answer_col]):
                    correct_answer = str(row[answer_col])
                
                # Get difficulty
                difficulty = 'M'
                if difficulty_col and pd.notna(row[difficulty_col]):
                    diff = str(row[difficulty_col]).upper()
                    if diff in ['E', 'EASY', '1']:
                        difficulty = 'E'
                    elif diff in ['H', 'HARD', '3']:
                        difficulty = 'H'
                
                # Get module
                module = 'math'
                if module_col and pd.notna(row[module_col]):
                    mod = str(row[module_col]).lower()
                    if 'reading' in mod:
                        module = 'reading'
                    elif 'writing' in mod:
                        module = 'writing'
                    elif 'math' in mod:
                        module = 'math'
                
                questions.append({
                    'id': f'csv-{index}',
                    'question': question_text,
                    'options': options,
                    'correct_answer': correct_answer,
                    'explanation': '',
                    'difficulty': difficulty,
                    'module': module,
                    'source': 'csv'
                })
            
            print(f"✅ Extracted {len(questions)} questions from CSV")
            return questions
            
        except Exception as e:
            print(f"❌ Error parsing CSV: {e}")
            return []
    
    def parse_json(self, json_path: str) -> List[Dict[str, Any]]:
        """
        Parse SAT questions from JSON files
        """
        print(f"📖 Parsing JSON: {json_path}")
        
        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            questions = []
            
            # Handle different JSON structures
            if isinstance(data, dict):
                # OnePrep format
                for question_id, question_data in data.items():
                    questions.append(self._parse_oneprep_question(question_id, question_data))
            elif isinstance(data, list):
                # Array format
                for i, question_data in enumerate(data):
                    questions.append(self._parse_generic_question(f'json-{i}', question_data))
            
            print(f"✅ Extracted {len(questions)} questions from JSON")
            return questions
            
        except Exception as e:
            print(f"❌ Error parsing JSON: {e}")
            return []
    
    def _parse_oneprep_question(self, question_id: str, question_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse OnePrep format question"""
        content = question_data.get('content', {})
        
        return {
            'id': question_id,
            'question': content.get('question', ''),
            'options': content.get('options', []),
            'correct_answer': content.get('correct_answer', ''),
            'explanation': content.get('explanation', ''),
            'difficulty': question_data.get('difficulty', 'M'),
            'module': question_data.get('module', 'math'),
            'source': 'oneprep'
        }
    
    def _parse_generic_question(self, question_id: str, question_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse generic question format"""
        return {
            'id': question_id,
            'question': question_data.get('question', question_data.get('content', '')),
            'options': question_data.get('options', question_data.get('choices', [])),
            'correct_answer': question_data.get('correct_answer', question_data.get('answer', '')),
            'explanation': question_data.get('explanation', ''),
            'difficulty': question_data.get('difficulty', 'M'),
            'module': question_data.get('module', 'math'),
            'source': 'json'
        }
    
    def convert_to_prepify_format(self, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Convert parsed questions to Prepify format
        """
        print("🔄 Converting to Prepify format...")
        
        prepify_questions = []
        
        for question in questions:
            prepify_question = {
                'question_id': question['id'],
                'external_id': None,
                'skill_cd': '',
                'skill_desc': '',
                'primary_class_cd': '',
                'primary_class_cd_desc': '',
                'difficulty': question['difficulty'],
                'module': question['module'],
                'content': {
                    'keys': [],
                    'rationale': '',
                    'question': question['question'],
                    'options': question['options'],
                    'correct_answer': question['correct_answer'],
                    'explanation': question['explanation']
                },
                'program': 'SAT',
                'score_band_range_cd': 5,
                'active': True
            }
            
            prepify_questions.append(prepify_question)
        
        return prepify_questions
    
    def save_to_json(self, questions: List[Dict[str, Any]], output_path: str):
        """
        Save questions to JSON file
        """
        print(f"💾 Saving {len(questions)} questions to {output_path}")
        
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as file:
            json.dump(questions, file, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved questions to {output_path}")
    
    def parse_file(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Parse a file based on its extension
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            print(f"❌ File not found: {file_path}")
            return []
        
        if file_path.suffix.lower() == '.pdf':
            return self.parse_pdf(str(file_path))
        elif file_path.suffix.lower() == '.csv':
            return self.parse_csv(str(file_path))
        elif file_path.suffix.lower() == '.json':
            return self.parse_json(str(file_path))
        else:
            print(f"❌ Unsupported file type: {file_path.suffix}")
            return []

def main():
    parser = argparse.ArgumentParser(description='Parse SAT questions from various sources')
    parser.add_argument('input', help='Input file or directory')
    parser.add_argument('-o', '--output', default='scripts/data/parsed-questions.json', 
                       help='Output JSON file path')
    parser.add_argument('--format', choices=['prepify', 'raw'], default='prepify',
                       help='Output format')
    
    args = parser.parse_args()
    
    # Initialize parser
    sat_parser = SATQuestionParser()
    
    # Parse input
    input_path = Path(args.input)
    all_questions = []
    
    if input_path.is_file():
        # Single file
        questions = sat_parser.parse_file(str(input_path))
        all_questions.extend(questions)
    elif input_path.is_dir():
        # Directory - parse all supported files
        for file_path in input_path.rglob('*'):
            if file_path.suffix.lower() in ['.pdf', '.csv', '.json']:
                questions = sat_parser.parse_file(str(file_path))
                all_questions.extend(questions)
    else:
        print(f"❌ Input not found: {input_path}")
        sys.exit(1)
    
    if not all_questions:
        print("❌ No questions found!")
        sys.exit(1)
    
    print(f"📊 Total questions found: {len(all_questions)}")
    
    # Convert to Prepify format if requested
    if args.format == 'prepify':
        all_questions = sat_parser.convert_to_prepify_format(all_questions)
    
    # Save to output file
    sat_parser.save_to_json(all_questions, args.output)
    
    print(f"\n🎉 Successfully parsed {len(all_questions)} questions!")
    print(f"📁 Output saved to: {args.output}")

if __name__ == '__main__':
    main() 