import {Button} from '@mui/material'

import useSettings from './hooks/useSettings';

function App() {


  const {themeMode, setColor, onToggleThemeMode, onChangeColor} = useSettings();

  return (
    <>
      <h1>{setColor.name} {themeMode}</h1>
      <Button variant='contained' onClick={onToggleThemeMode}>Hello world</Button>
      <Button variant='contained' onClick={(d) => {onChangeColor('blue')}}>Hello world</Button>
    </>
  );
}

export default App;
