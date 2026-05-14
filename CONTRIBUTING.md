# Contributing to LensLearn

Thank you for your interest in contributing to LensLearn! This project exists to make quality education accessible to every student with a smartphone, and community contributions are essential to that mission.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion, please open an issue on GitHub. Include as much detail as possible: what you expected, what happened, your device/browser, and steps to reproduce.

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly (especially offline mode and mobile)
5. Commit with a clear message: `git commit -m "Add: description of change"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request with a description of what you changed and why

### Areas Where Help Is Especially Welcome

- **Language support:** Adding new languages or improving existing translations
- **Educational datasets:** Creating curriculum-aligned Q&A pairs for model fine-tuning (any language, any subject)
- **Device testing:** Testing on low-end Android devices and reporting issues
- **Accessibility:** Improving screen reader support, keyboard navigation, and color contrast
- **Subject coverage:** Adding new subjects to the subject registry with appropriate keywords
- **Documentation:** Improving guides, adding examples, translating documentation

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/lenslearn.git
cd lenslearn

# Install dependencies
npm install

# Start Ollama with a Gemma model
ollama pull gemma4:e4b
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve

# Start the dev server
npm run dev
```

## Code Style

- React functional components with hooks
- All components use `forwardRef` and `memo` for performance
- CSS-in-JS with inline style objects (no CSS modules or styled-components)
- Zustand for state management
- ES module imports throughout

## Code of Conduct

Be respectful, inclusive, and constructive. LensLearn is built for students around the world — our community should reflect that same spirit of openness.

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.
