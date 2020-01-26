import React from 'react';
import Building, { LogicalBuilding, getSortedHeightsOfBuildingList } from './Building';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Droppable } from 'react-beautiful-dnd';

const ModeDropBox: React.FunctionComponent<{ disabled: boolean; getList: (id: string) => LogicalBuilding[]; height: number; }> = (props) => {
    const id = `MODE-${props.height}`;
    const list = props.getList(id);
    return <>
        <div className="mode-building-icon-holder">
            {list.length}
        </div>
        <Droppable isDropDisabled={props.disabled} droppableId={id} direction="horizontal" type="BUILDING">
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    className="mode-dropbox"
                    {...provided.droppableProps}
                >
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    </>;
}

const ModeTable: React.FunctionComponent<{ onHeightChosen?: (height: number) => void; getList: (id: string) => LogicalBuilding[]; }> = (props) => {
    const heights = getSortedHeightsOfBuildingList(props.getList("originalBuildingList"));
    const dropDisabled = typeof props.onHeightChosen == 'function';
    const onHeightChosen = React.useCallback((e: React.MouseEvent) => {
        if(dropDisabled)
            props.onHeightChosen(parseInt((e.currentTarget as HTMLElement).getAttribute("data-height"), 10));
    }, [ props.onHeightChosen ]);
    return <TableContainer component={Paper} className="mode-table">
        <Table>
            <TableHead>
                <TableRow>
                    {heights.map(height => <TableCell key={height}>{height}</TableCell>)}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    {heights.map(height => <TableCell className={dropDisabled ? "mode-table-clickable" : ""} onClick={onHeightChosen} data-height={height} key={height}><ModeDropBox disabled={dropDisabled} getList={props.getList} height={height}/></TableCell>)}
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>;
};
export default ModeTable;