class Queue {
  constructor() {
    this.items = [];
    this.processing = false;
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.items.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.items.length === 0) return;
    
    this.processing = true;
    const { task, resolve, reject } = this.items.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      this.process();
    }
  }
}

module.exports = new Queue(); 