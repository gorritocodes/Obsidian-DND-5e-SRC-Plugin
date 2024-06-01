import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class DndSRC extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		const vault = this.app.vault;

		const database = {
			"Ability-Scores":
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Ability-Scores.json",
			Alignments:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Alignments.json",
			Backgrounds:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Backgrounds.json",
			Classes:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Classes.json",
			Conditions:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Conditions.json",
			"Damage-Types":
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Damage-Types.json",
			"Equipment-Categories":
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Equipment-Categories.json",
			Equipment:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Equipment.json",
			Feats: "https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Feats.json",
			Languages:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Languages.json",
			Levels: "https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Levels.json",
			"Magic-Items":
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Magic-Items.json",
			"Magic-Schools":
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Magic-Schools.json",
			Monsters:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Monsters.json",
			Proficiencies:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Proficiencies.json",
			Races: "https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Races.json",
			"Rule-Sections":
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Rule-Sections.json",
			Rules: "https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Rules.json",
			Skills: "https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Skills.json",
			Spells: "https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Spells.json",
			Subclasses:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Subclasses.json",
			Subraces:
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Subraces.json",
			Traits: "https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Traits.json",
			"Weapon-Properties":
				"https://raw.githubusercontent.com/5e-bits/5e-database/main/src/5e-SRD-Weapon-Properties.json",
		};

		async function fetchCategory(category: string) {
			try {
				const response = await fetch(category);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				return data;
			} catch (error) {
				console.error("Error fetching category:", error);
			}
		}

		function createCategory(category: string) {
			vault.createFolder(category);
		}

		function createFile(category: string, name: string, content: string) {
			vault.create(`${category}/${name}.md`, content);
		}

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dices",
			"Create D&D Manual",
			async (evt: MouseEvent) => {
				try {
					const category = await fetchCategory(database["Races"]);
					console.log(category);

					if (category.length > 0) {
						const firstRaceName = category[0].name;
						new Notice(`First Race Name: ${firstRaceName}`);
						createCategory("Races");
						createFile("Races", category[0].name, "test");
					}
				} catch (error) {
					console.error("Error fetching categories:", error);
				}
			}
		);

		this.addRibbonIcon("dice", "Greet", () => {
			new Notice("D&D Rules!");
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Wow!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: DndSRC;

	constructor(app: App, plugin: DndSRC) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
