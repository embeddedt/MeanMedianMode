
import 'core-js/features/promise';
import 'core-js/features/array/find';
import 'core-js/features/array/from';
import 'core-js/features/symbol';
import 'core-js/features/string/starts-with';
import React from 'react';
import ReactDOM from 'react-dom';
import SetRunner from './SetRunner';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

window.addEventListener("load", () => {
    (window as any).gameContainer = document.getElementById('game-container');
    function App() {
        const [ currentlyPlaying, setCurrentlyPlaying ] = React.useState(true);
        const onEnd = React.useCallback(() => {
            setCurrentlyPlaying(false);
        }, []);
        const playAgain = React.useCallback(() => {
            setCurrentlyPlaying(true);
        }, []);
        return <>
            {currentlyPlaying && <SetRunner onSetEnd={onEnd}/>}
            <Dialog open={!currentlyPlaying} onClose={playAgain}>
                <DialogTitle>Thanks for playing!</DialogTitle>
                <DialogActions>
                    <Button color="primary" onClick={playAgain}>Play again?</Button>
                </DialogActions>
            </Dialog>
        </>;
    }
    ReactDOM.render(<App/>, (window as any).gameContainer);
});