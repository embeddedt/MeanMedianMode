import React from 'react';
import { LogicalBuilding, getSortedHeightsOfBuildingList } from './Building';
import { getRandomInt } from './utilities';
import shortid from 'shortid';
import BuildingList from './BuildingList';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import ModeTable from './ModeTable';

enum SetRunnerMode {
    ThatsRight = 0,
    Median_Order,
    Median_Sign,
    Mode_Categorize,
    Mode_ChooseOne,
    Mean,
    End
}

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};
/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function getRandomBuildingColor(): string {
    const c = HSVtoRGB(getRandomInt(0, 361) / 360, 0.8, 0.8);
    return `rgb(${c.r}, ${c.g}, ${c.b})`;
}
const NUM_BUILDINGS = 5;

export default class SetRunner extends React.PureComponent<{ onSetEnd?: () => void; }, { isHint: boolean; currentMode: SetRunnerMode; buildingList: LogicalBuilding[]; originalBuildingList: LogicalBuilding[]; lastError: string; errorDialogOpen: boolean; }> {
    claimedMedianIndex: number;
    nextModeIn: number;
    meanInputRef: React.RefObject<HTMLInputElement>;
    constructor(props) {
        super(props);
        const buildingList = [];
        for(var i = 0; i < (NUM_BUILDINGS-1); i++) {
            buildingList.push({ id: shortid.generate(), color: getRandomBuildingColor(), height: getRandomInt(5, 18) * 10 });
        }
        buildingList.push({ id: shortid.generate(), color: getRandomBuildingColor(),  height: buildingList[0].height });
        shuffle(buildingList);
        const allHeights = getSortedHeightsOfBuildingList(buildingList);
        let heightLists = {};
        allHeights.forEach(height => heightLists[`MODE-${height}`] = []);
        this.state = {
            buildingList: buildingList,
            originalBuildingList: buildingList,
            ...heightLists,
            currentMode: SetRunnerMode.Median_Order,
            lastError: "",
            errorDialogOpen: false,
            isHint: false
        };
        this.nextModeIn = 0;
        this.meanInputRef = React.createRef();
        this.getList = this.getList.bind(this);
    }
    getInstructionsForMode(): string {
        if(this.state.currentMode == SetRunnerMode.Median_Order)
            return "Sort the data set from shortest to tallest.";
        else if(this.state.currentMode == SetRunnerMode.Median_Sign)
            return "Find the median. Click on the building.";
        else if(this.state.currentMode == SetRunnerMode.ThatsRight)
            return `That's right!${this.nextModeIn == SetRunnerMode.End ? " You're done!" : ""}`;
        else if(this.state.currentMode == SetRunnerMode.Mode_Categorize)
            return "Drag the buildings to the appopriate categories.";
        else if(this.state.currentMode == SetRunnerMode.Mode_ChooseOne)
            return "Find the mode and click on the box under it.";
        else if(this.state.currentMode == SetRunnerMode.Mean)
            return `Figure out the mean of the buildings' heights and enter it in the textbox.`;
        else
            return null;
    }
    areBuildingsSorted() {
        var lastHeight = 0;
        return !this.state.buildingList.some((building) => {
            if(building.height < lastHeight)
                return true;
            else {
                lastHeight = building.height;
                return false;
            }
        });
    }
    resetLists(): any {
        const allHeights = getSortedHeightsOfBuildingList(this.state.originalBuildingList);
        let heightLists = {};
        allHeights.forEach(height => heightLists[`MODE-${height}`] = []);
        return {
            buildingList: this.state.originalBuildingList,
            ...heightLists
        };
    }
    getHeightsMean() {
        const heights = this.state.originalBuildingList.map(v => v.height);
        var sum = 0;
        heights.forEach((val) => {
            sum += val;
        });
        return sum / heights.length;
    }
    isMeanCorrect(publicize = false): boolean {
        const answeredMean = parseFloat(this.meanInputRef.current.value);
        if(isNaN(answeredMean)) {
            if(publicize)
                this.openDialog("That doesn't appear to be a number.");
            return false;
        }
        const realMean = this.getHeightsMean();
        if(answeredMean != realMean) {
            if(publicize)
                this.openDialog("Nope, that's not the right answer. Make sure you add up all the heights and then divide by the number of buildings.");
            return false;
        }
        return true;
    }
    onCheck = () => {
        if(this.state.currentMode == SetRunnerMode.Median_Order) {
            if(!this.areBuildingsSorted()) {
                this.openDialog("The buildings are not sorted from shortest to tallest.");
                return;
            }
        } else if(this.state.currentMode == SetRunnerMode.Median_Sign) {
            const medianIndex = Math.floor(this.state.buildingList.length / 2);
            if(this.claimedMedianIndex != medianIndex) {
                this.openDialog("That's not the median building. It should be the one in the middle.");
                return;
            }
        } else if(this.state.currentMode == SetRunnerMode.Mean) {
            if(!this.isMeanCorrect(true))
                return;
        }
        this.nextModeIn = this.state.currentMode + 1;
        const prevMode = this.state.currentMode;
        this.setState({ currentMode: SetRunnerMode.ThatsRight }, () => {
            let state = { currentMode: this.nextModeIn };
            if(prevMode == SetRunnerMode.Mode_ChooseOne) {
                state = { ...state, ...this.resetLists() };
            }
            setTimeout(() => {
                if(this.nextModeIn == SetRunnerMode.End && typeof this.props.onSetEnd == 'function')
                    this.props.onSetEnd();
                else
                    this.setState(state);
            }, 2000);
        });
    };
    needsCheckmark() {
        if(this.state.currentMode == SetRunnerMode.End || this.state.currentMode == SetRunnerMode.ThatsRight || this.state.currentMode == SetRunnerMode.Median_Sign || this.state.currentMode == SetRunnerMode.Mode_Categorize || this.state.currentMode == SetRunnerMode.Mode_ChooseOne)
            return false;
        return true;
    }
    allowDragging() {
        return !(this.state.currentMode == SetRunnerMode.End || this.state.currentMode == SetRunnerMode.ThatsRight || this.state.currentMode == SetRunnerMode.Median_Sign || this.state.currentMode == SetRunnerMode.Mode_ChooseOne || this.state.currentMode == SetRunnerMode.Mean);
    }
    onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                this.state[source.droppableId],
                source.index,
                destination.index
            );

            this.setState({
                [source.droppableId]: items
            } as any, () => {
                if(this.areBuildingsSorted())
                    this.onCheck();
            });
        } else {
            const newListHeight = parseInt(destination.droppableId.substr(5), 10);
            if(this.state.buildingList[source.index].height != newListHeight) {
                this.openDialog("That's not the right spot to put that building in.");
                return;
            }
            const result = move(
                this.state[source.droppableId],
                this.state[destination.droppableId],
                source,
                destination
            );

            this.setState({
                [source.droppableId]: result[source.droppableId],
                [destination.droppableId]: result[destination.droppableId]
            } as any, () => {
                if(this.state.currentMode == SetRunnerMode.Mode_Categorize && this.state.buildingList.length == 0) {
                    this.onCheck();
                }
            });
        }
    };
    openDialog(error: string, isHint = false) {
        this.setState({ lastError: error, errorDialogOpen: true, isHint });
    }
    onErrorClose = () => this.setState({ errorDialogOpen: false });
    onBuildingClick = (index: number) => {
        if(this.state.currentMode != SetRunnerMode.Median_Sign)
            return;
        this.claimedMedianIndex = index;
        this.onCheck();
    };
    getList(id: string): LogicalBuilding[] {
        return this.state[id];
    }
    onHeightChosen = (height: number) => {
        const heightLists = getSortedHeightsOfBuildingList(this.state.originalBuildingList).map(height => ({ array: this.state[`MODE-${height}`] as LogicalBuilding[], height })).sort((a, b) => a.array.length - b.array.length).reverse();
        var maxLength = heightLists[0].array.length;
        const filtered = heightLists.filter((val) => val.array.length <= maxLength);
        const isCorrect = filtered.some(val => height == val.height);
        if(isCorrect)
            this.onCheck();
        else
            this.openDialog("Nope, that isn't the one with the most buildings inside.");
    };
    onKeyUp = (e: React.KeyboardEvent) => {
        if(this.isMeanCorrect(e.key == "Enter"))
            this.onCheck();
    };
    getHintForMode(): string {
        if(this.state.currentMode == SetRunnerMode.Mode_ChooseOne) {
            return "Some sets of data have more than one possible mode.";
        } else
            return null;
    }
    showHint = () => {
        this.openDialog(this.getHintForMode(), true);
    };
    render() {
        return <DragDropContext onDragEnd={this.onDragEnd}>
            <div className="controls">
                <span className="instructions">
                    {this.getInstructionsForMode()}
                    {this.getHintForMode() != null ? <Button className="hint-button" onClick={this.showHint}><i className="fas fa-question-circle"></i></Button> : null}
                </span>
                {/*this.needsCheckmark() && <Button className="check-button" onClick={this.onCheck}>
                    <i className="fas fa-check"></i>
                </Button>*/}
            </div>
            {SetRunnerMode[this.state.currentMode].startsWith("Mode") && <ModeTable onHeightChosen={this.state.currentMode == SetRunnerMode.Mode_ChooseOne ? this.onHeightChosen : null} getList={this.getList}/>}
            {this.state.currentMode == SetRunnerMode.Mean && <span><input className="mean-input" type="number" ref={this.meanInputRef} onKeyUp={this.onKeyUp} onChange={this.onKeyUp as any}/>&nbsp;m</span>}
            <div className="game-spacer"></div>
            <div className="buildings-container">
                <BuildingList getList={this.getList}
                    onBuildingClick={this.onBuildingClick}
                    buildingPointer={this.state.currentMode == SetRunnerMode.Median_Sign}
                    draggingDisabled={!this.allowDragging()}/>
            </div>
            <Dialog open={this.state.errorDialogOpen} onClose={this.onErrorClose}>
                <DialogTitle>{this.state.isHint ? "Hint" : "Hmm..."}</DialogTitle>
                <DialogContent>{this.state.lastError}</DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={this.onErrorClose}>OK</Button>
                </DialogActions>
            </Dialog>
        </DragDropContext>;
    }
}