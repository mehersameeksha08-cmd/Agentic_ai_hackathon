import os
import sys
import json
import csv

# Ensure base and data directories are resolved relative to this file's location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from cleanup import cleanup_customers


def run_tests():
    print("=" * 70)
    print("RUNNING THE DATA CLEANUP AGENT TEST SUITE")
    print("=" * 70)

    # -------------------------------------------------------------
    # TEST INPUT A
    # -------------------------------------------------------------
    print("\n[TEST INPUT A] — Duplicate candidates")
    prompt_a = "Find duplicate customer records. Merge only when you are confident; flag uncertain cases."
    file_a = os.path.join(DATA_DIR, "test_input_a.json")
    with open(file_a, "r", encoding="utf-8") as f:
        data_a = json.load(f)

    result_a = cleanup_customers(data_a, prompt_a)
    print(f"Prompt: \"{prompt_a}\"")
    print(f"Total records: {result_a['total_records']}, Candidates evaluated: {len(result_a['decisions'])}")

    for d in result_a["decisions"]:
        print(f"  -> Pair ({d['customer_id_1']}, {d['customer_id_2']}) => Action: {d['action']}, Conf: {d['confidence']}, Reason: {d['reason']}")

    # Verify Test A conditions
    decisions_map_a = {
        (d["customer_id_1"], d["customer_id_2"]): d["action"]
        for d in result_a["decisions"]
    }
    # C1001 & C1044 must be MERGE
    assert decisions_map_a.get(("C1001", "C1044")) == "MERGE", f"Expected MERGE for C1001 & C1044, got {decisions_map_a.get(('C1001', 'C1044'))}"
    # C1001 & C1088 must be REVIEW
    assert decisions_map_a.get(("C1001", "C1088")) == "REVIEW", f"Expected REVIEW for C1001 & C1088, got {decisions_map_a.get(('C1001', 'C1088'))}"
    print(">> TEST INPUT A PASSED! Confident duplicate merged, uncertain candidate flagged for review.")

    # -------------------------------------------------------------
    # TEST INPUT B
    # -------------------------------------------------------------
    print("\n[TEST INPUT B] — Same name, different person")
    prompt_b = "Clean duplicates but do not merge two different customers just because their names match."
    file_b = os.path.join(DATA_DIR, "test_input_b.json")
    with open(file_b, "r", encoding="utf-8") as f:
        data_b = json.load(f)

    result_b = cleanup_customers(data_b, prompt_b)
    print(f"Prompt: \"{prompt_b}\"")
    print(f"Total records: {result_b['total_records']}, Candidates evaluated: {len(result_b['decisions'])}")

    for d in result_b["decisions"]:
        print(f"  -> Pair ({d['customer_id_1']}, {d['customer_id_2']}) => Action: {d['action']}, Conf: {d['confidence']}, Reason: {d['reason']}")

    # Verify Test B condition
    decision_b = result_b["decisions"][0]["action"]
    assert decision_b == "PRESERVE", f"Expected PRESERVE for C2001 & C2002, got {decision_b}"
    print(">> TEST INPUT B PASSED! Same name records preserved separately.")

    # -------------------------------------------------------------
    # TEST INPUT C
    # -------------------------------------------------------------
    print("\n[TEST INPUT C] — Conflicting record")
    prompt_c = "Resolve duplicate candidates conservatively."
    file_c = os.path.join(DATA_DIR, "test_input_c.json")
    with open(file_c, "r", encoding="utf-8") as f:
        data_c = json.load(f)

    result_c = cleanup_customers(data_c, prompt_c)
    print(f"Prompt: \"{prompt_c}\"")
    print(f"Total records: {result_c['total_records']}, Candidates evaluated: {len(result_c['decisions'])}")

    for d in result_c["decisions"]:
        print(f"  -> Pair ({d['customer_id_1']}, {d['customer_id_2']}) => Action: {d['action']}, Conf: {d['confidence']}, Reason: {d['reason']}")

    # Verify Test C condition
    decision_c = result_c["decisions"][0]["action"]
    assert decision_c == "REVIEW", f"Expected REVIEW for C3001 & C3002 due to conflicting phones, got {decision_c}"
    print(">> TEST INPUT C PASSED! Unsafe merge prevented when evidence conflicts; flagged for review.")

    # -------------------------------------------------------------
    # MASTER DATASET VERIFICATION
    # -------------------------------------------------------------
    print("\n[MASTER DATASET VERIFICATION]")
    master_a = result_a["master_dataset"]
    print(f"Master records generated for Test A: {len(master_a)}")
    for m in master_a:
        print(f"  -> Master ID: {m['master_id']}, Name: {m['name']}, Status: {m['record_status']}, Merged IDs: {m['merged_customer_ids']}, Sources: {m['sources']}")

    # Assert master dataset has the merged record
    merged_records = [m for m in master_a if m["record_status"] == "merged"]
    assert len(merged_records) == 1, "Expected 1 merged master record in Test A"
    assert "C1001" in merged_records[0]["merged_customer_ids"]
    assert "C1044" in merged_records[0]["merged_customer_ids"]
    print(">> MASTER DATASET PASSED! Golden records properly generated with source tracking.")

    # -------------------------------------------------------------
    # CSV INGESTION TEST
    # -------------------------------------------------------------
    print("\n[CSV INGESTION TEST]")
    file_csv = os.path.join(DATA_DIR, "sample_dataset.csv")
    with open(file_csv, "r", encoding="utf-8-sig") as f:
        csv_customers = list(csv.DictReader(f))
    result_csv = cleanup_customers(csv_customers, "Find duplicates conservatively; merge high confidence pairs and flag conflicts.")
    print(f"Loaded {len(csv_customers)} records from CSV.")
    print(f"Candidates evaluated: {len(result_csv['decisions'])}, Master records: {len(result_csv['master_dataset'])}")
    assert len(result_csv['decisions']) > 0
    print(">> CSV INGESTION PASSED!")

    print("\n" + "=" * 70)
    print("ALL TESTS PASSED SUCCESSFULLY (100% SPEC COMPLIANT)")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
