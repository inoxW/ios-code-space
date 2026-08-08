# ios-code-space

A public iOS coding environment inspired by Termux.

## Goal
Build a lightweight iOS app that lets users create, edit, organize, and run code with a terminal-like workflow, while respecting iOS sandbox constraints.

## MVP
- Project list
- Code editor
- File manager
- Console/output panel
- Run code via backend execution service
- Basic syntax highlighting

## High-level architecture
- **SwiftUI** for the UI
- **TextKit 2 / UITextView** for editing
- **FileManager** for local project files
- **SQLite / CoreData** for metadata
- **ExecutionService** for remote code execution
- **Keychain** for tokens

## Mermaid diagram

```mermaid
flowchart TB
  subgraph IOS[iOS App]
    PV[ProjectsView]
    EV[EditorView]
    CV[ConsoleView]
    FM[FileManager]
  end

  subgraph SL[Services]
    PS[ProjectService]
    EX[ExecutionService]
    FS[FileService]
    SH[SyntaxHighlightService]
  end

  subgraph LS[Local Storage]
    SF[Sandbox Files]
    SQ[SQLite / CoreData]
    KT[Keychain]
  end

  subgraph BE[Backend]
    API[API Gateway]
    JQ[Job Queue / Runner]
    RT[Runtime Containers / VMs]
  end

  PV --> EV
  EV --> CV
  EV --> FM
  FM --> FS
  FS --> SF
  PS --> SQ
  EX --> API
  EX --> CV
  SH --> EV
  KT --> API
  API --> JQ
  JQ --> RT
