# Introduction

I was working on a quiz application. For every question, the user had five seconds (for example) to answer the question. The five second timer
was shown in the UI and the user had a countdown to zero. If the user answered the question, the timer would stop and the next question
would appear with the timer reseted to the initial value (five seconds in this example).

When I started implementing this feature, it became a mush of setIterval(s) and setTimeout(s) and by looking at the code, someone that is
not familiar with what this component should be doing what not know what was going on.

For that reason, I started working on a more generic solution and this package was created. It offers a way to control timers in an intuitive, 
readable and maintainable way without the dangers of too many renders or forgetting to clear timers. 

# Install

`yarn add advanced-react-timer`
or
`npm install advanced-react-timer`

and import

``import useAdvancedTimer from 'advanced-react-timer``

# Usage

````typescript jsx
import useAdvancedTimer from 'advanced-react-timer';

function Timer() {
	useAdvancedTimer({
        maxTicks: 5,
        interval: 1000,
    });
}
````

This is a basic example of a timer. This timer will run indefinitely every 1000 milliseconds (every second). ``Timer`` component will render
only once and will not render for every elapsed timer (for every second). For now, ignore ``maxTicks`` option. I will cover that later on.
So how is this usable? Let's expand on this example.

````typescript jsx
import useAdvancedTimer from 'advanced-react-timer';

function Timer() {
    useAdvancedTimer({
        onTick() {
			
	},
        maxTicks: 5,
        interval: 1000,
    });
}
````

If you pass the `onTick` callback, `onTick` will run for every interval, in our example above every 1000 milliseconds. It is up to you what
you want to do with this callback. It is up to you what you do with this information. For example, if you simply wish to show how many times
the counter ran, you can:

````typescript jsx
import useAdvancedTimer from 'advanced-react-timer';
import {useState} from 'react';

function Timer() {
	const [count, setCount] = useState(0);
	
	useAdvancedTimer({
	    onTick() {
                setCount(a => a + 1);
	    },
	    maxTicks: 5,
	    interval: 1000,
	});
	
	return <p>{count}</p>;
}
````

But what is this ``maxTicks`` option? This option says that the timer will tread repetition of this timer as `elapsed` every five times the timer
repeats. It the example above, that is every five seconds (5000 milliseconds). We can use this with the `onElapsed` callback.

````typescript jsx
import useAdvancedTimer from 'advanced-react-timer';
import {useState} from 'react';

function Timer() {
	const [count, setCount] = useState(0);
	
	useAdvancedTimer({
            onElapsed() {
		console.log('The timer elapsed. 5 seconds have passed. I will reset the counter!');
		setCount(0);
            },
	    onTick() {
               setCount(a => a + 1);
	    },
	    maxTicks: 5,
	    interval: 1000,
	});
	
	return <p>{count}</p>;
}
````

As you can see, it is fairly easy to create reusable timers with a couple of lines of code and control how your component is rendered. In the
example above, `Timer` is only rendered when `setState` is called, not for the 'ticking' of the timer. 

If you want to stop the timer, you can use the `exit` return argument:

````typescript jsx
import useAdvancedTimer from 'advanced-react-timer';
import {useEffect, useState} from 'react';

function Timer() {
	const [count, setCount] = useState(0);

	const [exit] = useAdvancedTimer({
		onElapsed() {
			console.log('The timer elapsed. 5 seconds have passed. I will reset the counter!');
			setCount(0);
		},
                onExit() {
		        // onExit is called when timer is finished. In this case after the callback
                        // to setTimeout() is called after ten seconds.      
                },
		onTick() {
			setCount(a => a + 1);
		},
		maxTicks: 5,
		interval: 1000,
	});

	useEffect(() => {
	setTimeout(() => {
	    exit();
        }, 10000);
    }, [])

	return <p>{count}</p>;
}
````

Above timer will stop after ten seconds and you can react to it in the `onExit` callback. But this timer is still usable. If your UI needs to
run the timer even after you exit, you can ``restart`` it.

````typescript jsx
import useAdvancedTimer from 'advanced-react-timer';
import {useEffect, useState} from 'react';

function Timer() {
	const [count, setCount] = useState(0);

	const [exit, restart] = useAdvancedTimer({
		onElapsed() {
			console.log('The timer elapsed. 5 seconds have passed. I will reset the counter!');
			setCount(0);
		},
                onExit() {
			// onExit is called when timer is finished. In this case after the callback
                        // to setTimeout() is called after ten seconds.      
                },
                onRestart() {
			// onRestart() is called when restart() function is called. 
                },
		onTick() {
			setCount(a => a + 1);
		},
		maxTicks: 5,
		interval: 1000,
	});

	useEffect(() => {
	setTimeout(() => {
		exit();
        }, 10000);
		
	setTimeout(() => {
		restart();
        }, 12000)
    }, [])

	return <p>{count}</p>;
}
````

This timer will stop working after ten seconds but will again start working after twelve seconds like nothing had happened. If you read the introduction
and the example I had, when the user answered the question for example, two seconds before the timer elapsed, I would load the new question and
restart the timer again in the same component. 

## Reseting parameters

But what if you want to change the interval in the middle of a running timer? You can do that like this:

````typescript jsx
import useAdvancedTimer from 'advanced-react-timer';
import {useEffect, useState} from 'react';

function Timer() {
	const [count, setCount] = useState(0);

	const [exit, restart, updateProps] = useAdvancedTimer({
		onElapsed() {
		    setCount(0);
		},
		onTick() {
		    setCount(a => a + 1);
		},
		maxTicks: 5,
		interval: 1000,
	});
	
	useEffect(() => {
		setTimeout(() => {
			/**
                        * After five seconds, exit the current time, update maxTicks and interval and start the timer again.
			 */
		exit();
		updateProps(100, 2);
		restart();
        }, 5000);
    }, []);

	return <p>{count}</p>;
}
````

In the above example, after five seconds, we reset the timer to run every 100 milliseconds with elapsed time (`maxTicks`) every two ticks and the
timer continues with these parameters. That means that if the UI changed (user changed some UI parameters), you can change the timer on the fly without
re-rendering the underlying component or any other techniques. **It is important to ``exit()`` the timer before updating props since timer cannot be 
updated on the fly.** 

## Timer info

You can access the info of the timer with the ``info()`` function that is returned from the hook.

````typescript jsx
import useAdvancedTimer from 'advanced-react-timer';
import {useEffect, useState} from 'react';

function Timer() {
	const [count, setCount] = useState(0);

	const [info] = useAdvancedTimer({
            onTick() {
		console.log(info());
            },
	    maxTicks: 5, 
            interval: 1000,
	});

	return <p>{count}</p>;
}
````

``info()`` function returns the current state of the timer as follows:

- totalTicks (int): How many times the interval has ran. In the above example, this will increase with every tick. 
- numOfRestarts (int): How many restarts there were for this timer? A restart increments when you call the ``restart()`` function.
- numOfElapsed (int): How many elapsed timers where there? In the above example, `maxTicks` is five, therefor after 15 seconds, this value
will be three. 
- numOfExits (int): How many times the timer was stopped? This value increments every time you call the `exit()` function

It is very important to know that the information about the timer is cumulative. That means it never resets even after you call `exit()`, `restart()`
or `updateProps()`. It is counted and collected for the duration of the underlying component and for the duration of the browser session. If the component
is unmounted or the user refreshes the page, only then is the info reseted to its initial state.

# API

````typescript
interface UseAdvancedTimer {
	maxTicks: number;
	interval: number;
	onTick?(): void;
	onExit?(): void;
	onElapsed?(): void;
	onRestart?(): void;
}

type VoidFn = () => void;
type InfoFn = () => TimerInfo;
type UpdatePropsFn = (interval: number, maxTicks: number) => void;
````

``useAdvancedTimer(options: useAdvancedTimer): [VoidFn, VoidFn, UpdatePropsFn, InfoFn]``