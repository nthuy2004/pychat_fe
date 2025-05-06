import { useContext } from 'react';
import {SettingContext} from '../contexts/SettingContext';

const useSettings = () => useContext(SettingContext);

export default useSettings;
