import MainLayout from "./components/layout/MainLayout"
import AppRoutes from "./routes/index"
import { BrowserRouter as Router } from "react-router-dom"
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


export default function App() {
  return (
    <Router>
      <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col">
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </div>
      </DndProvider>
    </Router>
  )
}

