import {greet, greetWithType, MyType, UnmeshedClient} from '@unmeshed/unmeshed-js-sdk'
import {} from '@unmeshed/unmeshed-js-sdk'

const val: MyType = {
    name: 'String'
}
console.log(greet("hello world"));
console.log(greetWithType(val));

const unmeshedClient = new UnmeshedClient({
    baseUrl: 'http://localhost',
    port: 8080,
    authToken: 'iBPNno0dOpJ74bBy64l5',
    clientId: '0d368ea2-7ed7-4fc6-8506-d5d5115fce55'
});

unmeshedClient.registerWorkers();
unmeshedClient.startPolling();


unmeshedClient.getProcessData();
