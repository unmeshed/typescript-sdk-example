import {greet, greetWithType, MyType} from '@unmeshed/unmeshed-js-sdk'

const val : MyType = {
    name: 'String'
}
console.log(greet("hello world"));
console.log(greetWithType(val));
