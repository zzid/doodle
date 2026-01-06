import React, {
    createContext,
    useContext,
    useState,
    PropsWithChildren,
} from "react";
import { CalendarHighlightContextType } from "../types";

const CalendarHighlightContext = createContext<CalendarHighlightContextType>({
    highlightDate: null,
    showHighlight: false,
    setHighlightDate: () => {},
});

export const useCalendarHighlight = () => useContext(CalendarHighlightContext);

export const CalendarHighlightProvider: React.FC<PropsWithChildren<{}>> = ({
    children,
}) => {
    const [highlightDate, setHighlightDateState] = useState<string | null>(
        null
    );
    const [showHighlight, setShowHighlight] = useState(false);

    const setHighlightDate = (date: string | null, show?: boolean) => {
        setHighlightDateState(date);
        setShowHighlight(!!show);
    };

    return (
        <CalendarHighlightContext.Provider
            value={{ highlightDate, showHighlight, setHighlightDate }}
        >
            {children}
        </CalendarHighlightContext.Provider>
    );
};

