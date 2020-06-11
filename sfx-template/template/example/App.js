import React from 'react';
import {Notification} from '../src'
class App extends React.Component {
    onClick = (type) => {
        Notification[type]({
            message: type,
            description: `description--${type}`,
            duration: 0
        })
    }
    render() {
        return (
            <div>
                <button onClick={() => this.onClick('info')}>click me -info</button>
                <button onClick={() => this.onClick('success')}>click me -success</button>
                <button onClick={() => this.onClick('warning')}>click me -warning</button>
                <button onClick={() => this.onClick('error')}>click me -error</button>
            </div>
        )
    }
}

export default App;