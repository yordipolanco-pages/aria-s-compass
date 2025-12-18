import { Outlet, useParams } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
    // Sidebar handles its own params now, or we pass them if needed. 
    // Ideally Sidebar uses useParams internally or we pass them here.
    // But Sidebar is directly inside Layout.

    return (
        <div className="flex h-screen bg-pearl overflow-hidden font-body w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Outlet />
            </div>
        </div>
    );
}
