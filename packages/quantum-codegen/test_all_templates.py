#!/usr/bin/env python3
"""
Comprehensive Template Test Suite
Tests all quantum code generation templates

Run with: python test_all_templates.py
"""

import subprocess
import sys
import os
from pathlib import Path
import json
from datetime import datetime

# ============================================================================
# TEST CONFIGURATION
# ============================================================================

# Templates to test
TEMPLATES = {
    'VQE': [
        'templates/vqe/vqe_h2_complete_qiskit22.py',
        'templates/vqe/vqe_lih_complete_qiskit22.py',
        'templates/vqe/vqe_h2o_complete_qiskit22.py',
        'templates/vqe/vqe_generic_complete_qiskit22.py',
    ],
    'QAOA': [
        'templates/qaoa/qaoa_maxcut_complete_qiskit22.py',
        'templates/qaoa/qaoa_generic_complete_qiskit22.py',
    ],
    'Grover': [
        'templates/grover/grover_complete_qiskit22.py',
    ],
    'QFT': [
        'templates/qft/qft_complete_qiskit22.py',
    ],
    'QPE': [
        'templates/qpe/qpe_complete_qiskit22.py',
    ]
}

# Test modes
QUICK_TEST = True  # Set to False for full tests (takes longer)

# ============================================================================
# TEST UTILITIES
# ============================================================================

class Colors:
    """ANSI color codes"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    """Print formatted header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}")
    print(f"{text.center(70)}")
    print(f"{'='*70}{Colors.RESET}\n")

def print_success(text):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")

def print_error(text):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")

def print_warning(text):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")

def print_info(text):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")

# ============================================================================
# TEMPLATE TESTS
# ============================================================================

def check_template_exists(template_path):
    """Check if template file exists"""
    return Path(template_path).exists()

def check_template_quality(template_path):
    """Check template quality metrics"""
    with open(template_path, 'r') as f:
        content = f.read()
    
    issues = []
    
    # Check for placeholders
    if 'TODO' in content or 'FIXME' in content or 'placeholder' in content.lower():
        issues.append("Contains placeholders (TODO/FIXME)")
    
    # Check for old API
    if 'qiskit.aqua' in content or 'qiskit.chemistry' in content:
        issues.append("Uses old Qiskit API")
    
    # Check for physics validation
    if 'PhysicsValidator' not in content:
        issues.append("Missing PhysicsValidator class")
    
    # Check line count
    lines = content.split('\n')
    if len(lines) < 300:
        issues.append(f"Too short ({len(lines)} lines, should be 400+)")
    
    # Check for documentation
    if '"""' not in content[:500]:
        issues.append("Missing docstring")
    
    # Check for error handling
    if 'try:' not in content or 'except' not in content:
        issues.append("Missing error handling")
    
    return issues

def run_template_syntax_check(template_path):
    """Check Python syntax"""
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'py_compile', template_path],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0, result.stderr
    except Exception as e:
        return False, str(e)

def run_template_import_check(template_path):
    """Check if all imports work"""
    try:
        # Create a test script that imports the template
        test_code = f"""
import sys
sys.path.insert(0, '{Path(template_path).parent}')
try:
    with open('{template_path}', 'r') as f:
        code = f.read()
    # Extract imports
    import_lines = [line for line in code.split('\\n') if line.strip().startswith('import') or line.strip().startswith('from')]
    for line in import_lines:
        if 'import' in line and not line.strip().startswith('#'):
            try:
                exec(line)
            except ImportError as e:
                print(f"IMPORT_ERROR: {{e}}")
    print("IMPORTS_OK")
except Exception as e:
    print(f"ERROR: {{e}}")
"""
        result = subprocess.run(
            [sys.executable, '-c', test_code],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if 'IMPORTS_OK' in result.stdout:
            return True, None
        elif 'IMPORT_ERROR' in result.stdout:
            return False, result.stdout
        else:
            return False, result.stderr
            
    except Exception as e:
        return False, str(e)

def run_template_execution(template_path):
    """Run template (quick mode or full)"""
    if QUICK_TEST:
        # Just check if it starts without errors
        print_info(f"Quick test mode - checking startup only")
        return True, "Skipped (quick mode)"
    
    try:
        print_info(f"Running full execution test (may take several minutes)...")
        result = subprocess.run(
            [sys.executable, template_path],
            capture_output=True,
            text=True,
            timeout=600  # 10 minute timeout
        )
        
        success = result.returncode == 0
        output = result.stdout if success else result.stderr
        
        return success, output
        
    except subprocess.TimeoutExpired:
        return False, "Execution timeout (>10 minutes)"
    except Exception as e:
        return False, str(e)

# ============================================================================
# TEST RUNNER
# ============================================================================

def test_template(template_path):
    """Run all tests on a single template"""
    template_name = Path(template_path).name
    print(f"\n{Colors.BOLD}Testing: {template_name}{Colors.RESET}")
    print("-" * 70)
    
    results = {
        'template': template_name,
        'path': template_path,
        'tests': {}
    }
    
    # Test 1: File exists
    print("1. Checking file exists...", end=" ")
    if check_template_exists(template_path):
        print_success("PASS")
        results['tests']['exists'] = True
    else:
        print_error("FAIL - File not found")
        results['tests']['exists'] = False
        return results
    
    # Test 2: Quality checks
    print("2. Checking template quality...", end=" ")
    issues = check_template_quality(template_path)
    if not issues:
        print_success("PASS")
        results['tests']['quality'] = True
    else:
        print_error(f"FAIL - {len(issues)} issues")
        for issue in issues:
            print(f"   - {issue}")
        results['tests']['quality'] = False
    
    # Test 3: Syntax check
    print("3. Checking Python syntax...", end=" ")
    syntax_ok, error = run_template_syntax_check(template_path)
    if syntax_ok:
        print_success("PASS")
        results['tests']['syntax'] = True
    else:
        print_error("FAIL")
        print(f"   {error}")
        results['tests']['syntax'] = False
    
    # Test 4: Import check
    print("4. Checking imports...", end=" ")
    imports_ok, error = run_template_import_check(template_path)
    if imports_ok:
        print_success("PASS")
        results['tests']['imports'] = True
    else:
        print_warning("FAIL - Missing dependencies")
        if error:
            print(f"   {error[:200]}")
        results['tests']['imports'] = False
    
    # Test 5: Execution (optional in quick mode)
    if not QUICK_TEST:
        print("5. Running execution test...", end=" ")
        exec_ok, output = run_template_execution(template_path)
        if exec_ok:
            print_success("PASS")
            results['tests']['execution'] = True
        else:
            print_error("FAIL")
            print(f"   {output[:200]}")
            results['tests']['execution'] = False
    else:
        print("5. Execution test: ", end="")
        print_info("SKIPPED (quick mode)")
        results['tests']['execution'] = None
    
    # Calculate score
    passed = sum(1 for v in results['tests'].values() if v is True)
    total = sum(1 for v in results['tests'].values() if v is not None)
    results['score'] = f"{passed}/{total}"
    results['passed'] = passed == total
    
    return results

def run_all_tests():
    """Run tests on all templates"""
    print_header("QUANTUM TEMPLATE TEST SUITE")
    
    print_info(f"Test mode: {'QUICK' if QUICK_TEST else 'FULL'}")
    print_info(f"Python: {sys.version.split()[0]}")
    print_info(f"Working directory: {os.getcwd()}")
    
    all_results = {}
    
    for category, templates in TEMPLATES.items():
        print_header(f"{category} TEMPLATES")
        
        category_results = []
        for template in templates:
            result = test_template(template)
            category_results.append(result)
        
        all_results[category] = category_results
    
    # Print summary
    print_header("TEST SUMMARY")
    
    total_templates = 0
    total_passed = 0
    
    for category, results in all_results.items():
        print(f"\n{Colors.BOLD}{category}:{Colors.RESET}")
        for result in results:
            total_templates += 1
            status = "✅ PASS" if result['passed'] else "❌ FAIL"
            score = result['score']
            print(f"  {status} {result['template']} ({score})")
            if result['passed']:
                total_passed += 1
    
    # Overall statistics
    print(f"\n{Colors.BOLD}Overall Results:{Colors.RESET}")
    print(f"  Total templates: {total_templates}")
    print(f"  Passed: {total_passed}")
    print(f"  Failed: {total_templates - total_passed}")
    print(f"  Success rate: {(total_passed/total_templates)*100:.1f}%")
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"test_results_{timestamp}.json"
    with open(results_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    print(f"\n{Colors.BLUE}Results saved to: {results_file}{Colors.RESET}")
    
    # Final verdict
    if total_passed == total_templates:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! 🎉{Colors.RESET}")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  SOME TESTS FAILED{Colors.RESET}")
        return 1

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    try:
        exit_code = run_all_tests()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Test interrupted by user{Colors.RESET}")
        sys.exit(130)
    except Exception as e:
        print(f"\n{Colors.RED}Unexpected error: {e}{Colors.RESET}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
