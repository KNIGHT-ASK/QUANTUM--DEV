# 🚀 How to Run Quantum Dev in VS Code

## ⚡ QUICK START (3 Steps)

### Step 1: Open Correct Folder
```
Open in VS Code: d:\Quantum MCP\Roo-Code-main\Roo-Code-main
```
**IMPORTANT:** Open `Roo-Code-main\Roo-Code-main`, NOT the parent folder!

---

### Step 2: Install Dependencies
```bash
# In VS Code terminal (Ctrl + `)
npm install
```

Wait for installation to complete (~2-3 minutes)

---

### Step 3: Press F5
```
Press F5 (or Run → Start Debugging)
```

This will:
1. Compile TypeScript
2. Launch Extension Development Host
3. Open new VS Code window with Quantum Dev loaded

---

## 🎯 TESTING QUANTUM DEV

### In the New VS Code Window:

1. **Open Command Palette:** `Ctrl+Shift+P`
2. **Type:** "Quantum Dev" or "Roo"
3. **Select:** Your quantum mode
4. **Start chatting!**

### Test with These Prompts:

**TEST 1 - Bell State:**
```
Create a Bell state with 2 qubits. Generate code for Qiskit, Cirq, and PennyLane.
```

**TEST 2 - H2 VQE:**
```
Calculate H2 ground state energy at 0.735 Å using VQE. Target -1.137 Hartree.
```

**TEST 3 - Validation:**
```
Validate quantum state [1, 0.5, 0, 0]. Check normalization and fix if needed.
```

---

## 📁 FOLDER STRUCTURE

```
d:\Quantum MCP\Roo-Code-main\
└── Roo-Code-main\              ← OPEN THIS IN VS CODE!
    ├── .vscode\
    │   └── launch.json         ← F5 configuration
    ├── src\                    ← Extension source
    ├── packages\               ← Quantum Dev packages
    │   ├── quantum-physics\
    │   ├── quantum-codegen\
    │   └── quantum-knowledge\
    ├── examples\               ← Test examples
    └── package.json            ← Dependencies
```

---

## 🔧 TROUBLESHOOTING

### Issue: "Cannot find module 'vscode'"
**Solution:** This is normal! The vscode module is provided by VS Code at runtime.
- Just press F5 anyway - it will work!

### Issue: Extension doesn't load
**Solution:**
```bash
# Rebuild packages
cd packages/quantum-physics && npm run build
cd ../quantum-codegen && npm run build
cd ../quantum-knowledge && npm run build
cd ../..

# Try F5 again
```

### Issue: TypeScript errors
**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🎮 DEBUGGING CONTROLS

When Extension Development Host opens:

- **F5** - Start debugging
- **Ctrl+Shift+F5** - Restart debugging
- **Shift+F5** - Stop debugging
- **F10** - Step over
- **F11** - Step into

---

## 📊 WHAT TO EXPECT

### Successful Launch:
```
✅ Extension Host starts
✅ New VS Code window opens
✅ "Quantum Dev" appears in command palette
✅ Chat panel available
✅ All quantum packages loaded
```

### In Debug Console:
```
Activating extension...
Loading quantum-physics package...
Loading quantum-codegen package...
Loading quantum-knowledge package...
Quantum Dev ready! 🚀
```

---

## 🧪 TESTING CHECKLIST

After F5, verify:

- [ ] Extension Development Host window opened
- [ ] Command palette shows Quantum Dev commands
- [ ] Chat panel is accessible
- [ ] Can send test prompts
- [ ] Responses include physics reasoning
- [ ] Code generation works
- [ ] Multi-framework output available

---

## 🎯 EXPECTED BEHAVIOR

### For "Create Bell State" prompt:

**Should see:**
1. Physics explanation of Bell state
2. Circuit description (H + CNOT)
3. Generated code for Qiskit
4. Generated code for Cirq
5. Generated code for PennyLane
6. Entanglement validation

**Should NOT see:**
- Generic code without physics
- Single framework only
- No validation
- Errors about missing modules

---

## 🚨 COMMON ERRORS & FIXES

### Error: "Extension host terminated unexpectedly"
**Fix:** Check console for actual error, usually missing dependency
```bash
npm install
```

### Error: "Cannot find package @quantum-dev/physics-core"
**Fix:** Build packages first
```bash
cd packages/quantum-physics && npm run build
```

### Error: UI crashes
**Fix:** Check src/shared/modes.ts has proper types (we just fixed this!)

---

## 💡 PRO TIPS

1. **Keep Debug Console Open:** See real-time logs
2. **Use Breakpoints:** Set in src/ files to debug
3. **Hot Reload:** Some changes auto-reload, others need Ctrl+Shift+F5
4. **Check Output Panel:** Select "Quantum Dev" from dropdown

---

## 📞 IF STUCK

1. Check Debug Console for errors
2. Verify all 3 packages built successfully
3. Ensure correct folder opened (Roo-Code-main\Roo-Code-main)
4. Try clean reinstall: `rm -rf node_modules && npm install`
5. Restart VS Code completely

---

## ✅ SUCCESS CRITERIA

You'll know it's working when:

✅ F5 launches without errors
✅ New window opens with extension loaded
✅ Test prompts get physics-first responses
✅ Multi-framework code generated
✅ Validation engine catches errors
✅ arXiv integration works

---

**READY TO TEST! Press F5 and let's see Quantum Dev in action!** 🚀⚛️

---

*Quantum Dev - Where Physics Meets Intelligence*
