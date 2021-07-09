## Tween
Tween 不是一个Canvee Extension，它可以单独通过new Tween() 来使用。

Tween 不负责执行动画，它提供一个slicing方法接受用户自定义的函数并为期传入对应的动画执行过程的变化值，例如
``` javascript
// tween表示在一秒钟内线性地将数字0变为100
const tween = new Tween({
    from: 0,
    to: 100,
    duration: 1000,
    curve: Linear
})
// slicing中的函数将在每一帧时都被调用，其中 v 代表此时数字应变为的值，p代表当前进度
tween.slicing((v,p)=>{
    // 手动将compoenent的positonX改变，以此达到平移动画的效果
    component.transform.position.x=v
})

// 手动播放动画
tween.play()
```

你也可以使用tween来设置一组连续动画，如：
``` javascript
// tween表示在两秒钟内线性地将数字0变为100，再从100变为0
const tween = new Tween({
    from: 0,
    to: 100,
    duration: 1000,
    curve: Linear
}).tween({
    from: 100,
    to: 0,
    duration: 1000,
    curve: Linear
})
tween.slicing((v,p)=>{
    // component将向左移动100单位，然后再移回原位
    component.transform.position.x=v
})

// 手动播放动画
tween.play()
```

你也可以通过Tween的pause和resume方法来暂停或者继续执行函数。