/**
 * Binary Min-Heap Priority Queue.
 * Dequeue always returns the element with the LOWEST priority value.
 * O(log n) enqueue and dequeue — suitable for large grids.
 */
export class PriorityQueue {
    constructor() {
        this._heap = []; // array of { element, priority }
    }

    get size() { return this._heap.length; }

    isEmpty() { return this._heap.length === 0; }

    enqueue(element, priority) {
        this._heap.push({ element, priority });
        this._bubbleUp(this._heap.length - 1);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        const top = this._heap[0].element;
        const last = this._heap.pop();
        if (this._heap.length > 0) {
            this._heap[0] = last;
            this._sinkDown(0);
        }
        return top;
    }

    // ── Internal heap helpers ──────────────────────────────────────────────────

    _bubbleUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this._heap[parent].priority <= this._heap[i].priority) break;
            this._swap(i, parent);
            i = parent;
        }
    }

    _sinkDown(i) {
        const n = this._heap.length;
        while (true) {
            let smallest = i;
            const left  = 2 * i + 1;
            const right = 2 * i + 2;
            if (left  < n && this._heap[left].priority  < this._heap[smallest].priority) smallest = left;
            if (right < n && this._heap[right].priority < this._heap[smallest].priority) smallest = right;
            if (smallest === i) break;
            this._swap(i, smallest);
            i = smallest;
        }
    }

    _swap(a, b) {
        const tmp = this._heap[a];
        this._heap[a] = this._heap[b];
        this._heap[b] = tmp;
    }
}
