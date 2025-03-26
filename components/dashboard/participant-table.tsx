"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { showParticipantKey } from "./participantKey"
import { useParticipantManager, StartClassType, Result } from "@/hooks/useParticipants"
import { toast } from "sonner"

// Helper functions for new columns
const calculateCompletedRoutes = (results: Result): string => {
    let completed = 0;
    const totalRoutes = 8;

    for (let i = 1; i <= totalRoutes; i++) {
        const route = `Route${i}` as keyof Result;
        if (results[route].zone > 0) {
            completed++;
        }
    }

    return `${completed}/${totalRoutes}`;
}

const calculateTotalScore = (results: Result): number => {
    let totalScore = 0;

    for (let i = 1; i <= 8; i++) {
        const route = `Route${i}` as keyof Result;
        totalScore += results[route].zone - results[route].attempts;
    }

    return totalScore;
}

export function ParticipantsTable() {
    // State for the table
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")

    // State for dialogs
    const [addDialogOpen, setAddDialogOpen] = React.useState(false)
    const [editResultsDialogOpen, setEditResultsDialogOpen] = React.useState(false)
    const [selectedParticipant, setSelectedParticipant] = React.useState<string | null>(null)
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = React.useState(false)
    const [participantToDelete, setParticipantToDelete] = React.useState<string | null>(null)

    // New participant form state
    const [newParticipant, setNewParticipant] = React.useState({
        name: "",
        startclass: "Maennlich" as StartClassType,
        secret: ""
    })

    // Edit results form state
    const [editResults, setEditResults] = React.useState<{
        route: string;
        zone: number;
        attempts: number;
    }>({
        route: "Route1",
        zone: 0,
        attempts: 0
    })

    // Get participants data and functions from the custom hook
    const {
        participants,
        participantsLoading,
        participantsError,
        refetchParticipants,
        createParticipant,
        createLoading,
        updateResults,
        updateLoading
    } = useParticipantManager()

    // Fetch participants on component mount
    React.useEffect(() => {
        refetchParticipants()
    }, [refetchParticipants])

    // Define table columns
    const columns: ColumnDef<any>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "startclass",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Startklasse
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return <div className="font-medium">{row.getValue("startclass")}</div>
            },
        },
        {
            accessorKey: "id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("id")}</div>
            ),
        },
        {
            accessorKey: "registrationDate",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Registriert am
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("registrationDate"))
                return <div className="text-right font-medium">{date.toLocaleString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })}</div>
            },
        },
        {
            id: "routesCompleted",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Routes Abgeschlossen
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const participant = row.original;
                // Count completed routes (zones > 0)
                const completedRoutes = Object.values(participant.results).filter(
                    route => route.zone > 0
                ).length;

                return <div className="font-medium">{completedRoutes} / 8</div>
            },
            sortingFn: (rowA, rowB) => {
                const countA = Object.values(rowA.original.results).filter(
                    route => route.zone > 0
                ).length;
                const countB = Object.values(rowB.original.results).filter(
                    route => route.zone > 0
                ).length;

                return countA - countB;
            },
            enableSorting: true,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const participant = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="hover:cursor-pointer"
                                onClick={() => showParticipantKey(participant.secret)}
                            >
                                Show Key
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:cursor-pointer"
                                onClick={() => {
                                    setSelectedParticipant(participant.id)
                                    setEditResultsDialogOpen(true)
                                }}
                            >
                                Ergebnisse Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="hover:cursor-pointer text-red-500"
                                onClick={() => {
                                    setParticipantToDelete(participant.id)
                                    setConfirmDeleteDialogOpen(true)
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    // Initialize table with data
    const table = useReactTable({
        data: participants,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        filterFns: {
            fuzzy: (row, columnId, value) => {
                const itemRank = String(row.getValue(columnId))
                    .toLowerCase()
                    .indexOf(String(value).toLowerCase())
                return itemRank !== -1
            },
        },
        globalFilterFn: (row, columnId, filterValue) => {
            const value = row.getValue(columnId)
            return value !== undefined
                ? String(value)
                    .toLowerCase()
                    .includes(String(filterValue).toLowerCase())
                : false
        },
    })

    // Handle global search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setGlobalFilter(value)
    }

    // Handle new participant form submission
    const handleAddParticipant = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createParticipant(
                newParticipant.name,
                newParticipant.startclass,
                newParticipant.secret
            )
            setAddDialogOpen(false)
            setNewParticipant({
                name: "",
                startclass: "Maennlich",
                secret: ""
            })
            refetchParticipants()
            toast({
                title: "Teilnehmer hinzugefügt",
                description: `${newParticipant.name} wurde erfolgreich registriert.`,
            })
        } catch (error) {
            toast({
                title: "Fehler",
                description: "Der Teilnehmer konnte nicht hinzugefügt werden.",
                variant: "destructive"
            })
        }
    }

    // Handle edit results form submission
    const handleUpdateResults = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedParticipant) return

        const routeNumber = parseInt(editResults.route.replace("Route", ""), 10)

        try {
            await updateResults(
                selectedParticipant,
                routeNumber,
                editResults.zone,
                editResults.attempts
            )
            setEditResultsDialogOpen(false)
            refetchParticipants()
            toast({
                title: "Ergebnisse aktualisiert",
                description: `Die Ergebnisse wurden erfolgreich aktualisiert.`,
            })
        } catch (error) {
            toast({
                title: "Fehler",
                description: "Die Ergebnisse konnten nicht aktualisiert werden.",
                variant: "destructive"
            })
        }
    }

    // Handle delete participant
    const handleDeleteParticipant = async () => {
        // Implementation would depend on your API
        // This is a placeholder for actual deletion logic
        console.log("Delete participant with ID:", participantToDelete)
        setConfirmDeleteDialogOpen(false)
        // After deletion, refetch participants
        refetchParticipants()
    }

    // Get the selected participant's data
    const getSelectedParticipantData = () => {
        if (!selectedParticipant) return null
        return participants.find(p => p.id === selectedParticipant)
    }

    // When a participant is selected for editing, initialize the form with their data
    React.useEffect(() => {
        if (selectedParticipant) {
            const participant = getSelectedParticipantData()
            if (participant) {
                // Initialize with Route1 data
                setEditResults({
                    route: "Route1",
                    zone: participant.results.Route1.zone,
                    attempts: participant.results.Route1.attempts
                })
            }
        }
    }, [selectedParticipant])

    // Handle route change in edit form
    const handleRouteChange = (value: string) => {
        const participant = getSelectedParticipantData()
        if (participant) {
            const routeKey = value as keyof Result
            setEditResults({
                route: value,
                zone: participant.results[routeKey].zone,
                attempts: participant.results[routeKey].attempts
            })
        }
    }

    return (
        <div className="w-full">
            <h1 className="text-4xl text-bold">Teilnehmer</h1>

            {/* Filters and controls */}
            <div className="flex items-center justify-start py-4">
                <Input
                    placeholder="Suchen..."
                    value={globalFilter}
                    onChange={handleSearch}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-2">
                            Spalten <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Add participant dialog trigger */}
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="ml-auto">
                            <Plus className="mr-2 h-4 w-4" />Teilnehmer hinzufügen
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Neuen Teilnehmer hinzufügen</DialogTitle>
                            <DialogDescription>
                                Tragen Sie die Daten des neuen Teilnehmers ein.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAddParticipant}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newParticipant.name}
                                        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="startclass" className="text-right">
                                        Startklasse
                                    </Label>
                                    <Select
                                        value={newParticipant.startclass}
                                        onValueChange={(value) => setNewParticipant({ ...newParticipant, startclass: value as StartClassType })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Wählen Sie eine Klasse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Maennlich">Männlich</SelectItem>
                                            <SelectItem value="Weiblich">Weiblich</SelectItem>
                                            <SelectItem value="Maennlich_Ue40">Männlich Ü40</SelectItem>
                                            <SelectItem value="Weiblich_Ue40">Weiblich Ü40</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="secret" className="text-right">
                                        Geheimcode
                                    </Label>
                                    <Input
                                        id="secret"
                                        type="text"
                                        value={newParticipant.secret}
                                        onChange={(e) => setNewParticipant({ ...newParticipant, secret: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                                    Abbrechen
                                </Button>
                                <Button type="submit" disabled={createLoading}>
                                    {createLoading ? "Speichern..." : "Speichern"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Participants table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {participantsLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Edit Results Dialog */}
            <Dialog open={editResultsDialogOpen} onOpenChange={setEditResultsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ergebnisse bearbeiten</DialogTitle>
                        <DialogDescription>
                            Aktualisieren Sie die Ergebnisse für den Teilnehmer.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateResults}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="route" className="text-right">
                                    Route
                                </Label>
                                <Select
                                    value={editResults.route}
                                    onValueChange={handleRouteChange}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Wählen Sie eine Route" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Route1">Route 1</SelectItem>
                                        <SelectItem value="Route2">Route 2</SelectItem>
                                        <SelectItem value="Route3">Route 3</SelectItem>
                                        <SelectItem value="Route4">Route 4</SelectItem>
                                        <SelectItem value="Route5">Route 5</SelectItem>
                                        <SelectItem value="Route6">Route 6</SelectItem>
                                        <SelectItem value="Route7">Route 7</SelectItem>
                                        <SelectItem value="Route8">Route 8</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="zone" className="text-right">
                                    Zone
                                </Label>
                                <Input
                                    id="zone"
                                    type="number"
                                    value={editResults.zone}
                                    onChange={(e) => setEditResults({ ...editResults, zone: parseInt(e.target.value) })}
                                    className="col-span-3"
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="attempts" className="text-right">
                                    Versuche
                                </Label>
                                <Input
                                    id="attempts"
                                    type="number"
                                    value={editResults.attempts}
                                    onChange={(e) => setEditResults({ ...editResults, attempts: parseInt(e.target.value) })}
                                    className="col-span-3"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditResultsDialogOpen(false)}>
                                Abbrechen
                            </Button>
                            <Button type="submit" disabled={updateLoading}>
                                {updateLoading ? "Speichern..." : "Speichern"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <AlertDialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Teilnehmer löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden. Der Teilnehmer wird dauerhaft aus der Datenbank gelöscht.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteParticipant} className="bg-red-500 hover:bg-red-600">
                            Löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}