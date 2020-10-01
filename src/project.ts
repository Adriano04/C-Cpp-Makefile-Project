import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

export enum Language {
    C,
    CPP
}

class Project {
    private compiler: string;
    private std: string;
    private ext: string;
    srcDir: string;
    objDir: string;
    isSimple: boolean;

    constructor(language: Language, 
                isSimple: boolean) {
        switch (language) {
            case Language.C:
                this.compiler = 'gcc';
                this.std = 'c11';
                this.ext = '.c';
                break;
            case Language.CPP:
                this.compiler = 'g++';
                this.std = 'c++11';
                this.ext = '.cpp';
                break;
            default:
                throw new Error('Language not supported!');
        }
        if (isSimple) {
            this.srcDir = this.objDir = '.';
        } else {
            this.srcDir = 'src';
            this.objDir = 'obj';
        }
        this.isSimple = isSimple;
    }

    toString() {
        return `########################################################################
####################### Makefile Template ##############################
########################################################################

# Compiler settings - Can be customized.
CC = ${this.compiler}
CXXFLAGS = -std=${this.std} -Wall
LDFLAGS = 

# Makefile settings - Can be customized.
APPNAME = myapp
EXT = ${this.ext}
SRCDIR = ${this.srcDir}
OBJDIR = ${this.objDir}

############## Do not change anything from here downwards! #############
SRC = $(wildcard $(SRCDIR)/*$(EXT))
OBJ = $(SRC:$(SRCDIR)/%$(EXT)=$(OBJDIR)/%.o)
DEP = $(OBJ:$(OBJDIR)/%.o=%.d)
# UNIX-based OS variables & settings
RM = rm
DELOBJ = $(OBJ)
# Windows OS variables & settings
DEL = del
EXE = .exe
WDELOBJ = $(SRC:$(SRCDIR)/%$(EXT)=$(OBJDIR)\\\\%.o)

########################################################################
####################### Targets beginning here #########################
########################################################################

all: $(APPNAME)

# Builds the app
$(APPNAME): $(OBJ)
\t$(CC) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)

# Creates the dependecy rules
%.d: $(SRCDIR)/%$(EXT)
\t@$(CPP) $(CFLAGS) $< -MM -MT $(@:%.d=$(OBJDIR)/%.o) >$@

# Includes all .h files
-include $(DEP)

# Building rule for .o files and its .c/.cpp in combination with all .h
$(OBJDIR)/%.o: $(SRCDIR)/%$(EXT)
\t$(CC) $(CXXFLAGS) -o $@ -c $<

################### Cleaning rules for Unix-based OS ###################
# Cleans complete project
.PHONY: clean
clean:
\t$(RM) $(DELOBJ) $(DEP) $(APPNAME)

# Cleans only all files with the extension .d
.PHONY: cleandep
cleandep:
\t$(RM) $(DEP)

#################### Cleaning rules for Windows OS #####################
# Cleans complete project
.PHONY: cleanw
cleanw:
\t$(DEL) $(WDELOBJ) $(DEP) $(APPNAME)$(EXE)

# Cleans only all files with the extension .d
.PHONY: cleandepw
cleandepw:
\t$(DEL) $(DEP)`;
    }
}

function createMakefile(project: Project, dirPath: string) {
    let makefilePath = path.join(dirPath, 'Makefile');
    fs.writeFileSync(makefilePath, project.toString());

    let makefileUri = vscode.Uri.file(makefilePath);
    vscode.workspace.openTextDocument(makefileUri).then(doc => {
        vscode.window.showTextDocument(doc);
    });
}

export function createProject(language: Language, isSimple: boolean): boolean {
    let cwd = vscode.workspace.rootPath;
    if (cwd == null) {
        return false;
    }

    let project = new Project(language, isSimple);
    if (project.isSimple) {
        createMakefile(project, cwd);
    } else {
        let srcDir = path.join(cwd, project.srcDir);
        let objDir = path.join(cwd, project.objDir);
        if (!fs.existsSync(srcDir)) {
            let incDir = path.join(srcDir, 'include');
            fs.mkdirSync(srcDir);
            fs.mkdirSync(incDir);
        }
        if (!fs.existsSync(objDir)) {
            fs.mkdirSync(objDir);
        }
        createMakefile(project, cwd);
    }
    return true;
}
