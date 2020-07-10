class MyPromise {
  constructor(executor) {
    let self = this;
    this.status = 'pending';         // promise状态, 作用：避免执行多次resolve
    this.data = null;                // 传递的数据
    this.resolveList = [];           // 成功列表
    this.rejectCallback = null;      // 失败回调

    // 成功回调
    function resolve(data) {
      // 用宏任务代替queueMicrotask模拟promise微任务
      setTimeout(() => {
        if (self.status === 'pending') {
          self.status = 'resolved';
          self.data = data;

          self.resolveList.forEach(callback => {
            // 更新回调列表传递的值
            let newData = callback(self.data);
            self.data = newData;
          })
        }
      })
    }

    // 失败回调
    function reject(reason) {
      // 用宏任务代替queueMicrotask模拟promise微任务
      setTimeout(() => {
        if (self.status === 'pending') {
          self.status = 'rejected';
          self.data = reason;
          self.rejectCallback(reason)
        }
      })
    }

    executor(resolve, reject)
  }

  then(onResolve, onReject) {
    this.resolveList.push(onResolve);

    // 检查触发then时是否有填写第二个参数, 若有则error将不返回错误到catch方法中，直接返回到第一个出现reject回调的then方法中
    if (onReject && !this.rejectCallback) { 
      this.rejectCallback = onReject
    }

    // 返回实例使它可以继续使用then方法
    return this
  }

  catch(callback) {
    // 判断前面的then调用时是否填写了第二个参数
    if (!this.rejectCallback) {
      this.rejectCallback = callback;
    }
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      let result = [];

      promises.forEach(promise => {
        promise.then(value => { 
          result.push(value)

          if (result.length === promises.length) {
            resolve(result)
          }
        })
      })
    })
  }
}

// let test = new MyPromise((resolve, reject) => {
//   console.log('三秒后出结果...')
//   let num = Math.random();

//   setTimeout(() => {
//     num > 0.5 ? resolve(num) : reject(num)
//   }, 3000)
  
// }).then(value => {
//   console.log('then1:', value)
//   return value + 1

// }).then(value => {
//   console.log('then2:', value)

// }).catch(err => {
//   console.log('出错了:', err)
// })

let p1 = new MyPromise(resolve => {
  setTimeout(() => {
    resolve(1)
  }, 2000)
})
let p2 = new MyPromise(resolve => {
  setTimeout(() => {
    resolve(2)
  }, 3000)
})
MyPromise.all([p1, p2]).then(result => console.log('result:', result))