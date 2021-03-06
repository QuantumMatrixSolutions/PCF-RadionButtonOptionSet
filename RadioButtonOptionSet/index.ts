import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class RadioButtonOptionSet implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private notifyOutputChanged: () => void;
	private radioButtonArray: HTMLInputElement[];
	private logicalName: string;
	private container: HTMLDivElement;
	private activeContainer: HTMLDivElement;
	private readOnlyContainer: HTMLDivElement;
	private selectedValue: number | undefined;
	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		// Add control initialization code
		this.notifyOutputChanged = notifyOutputChanged;

		this.container = container;
		this.activeContainer = document.createElement("div");
		this.activeContainer.className = "container";

		this.readOnlyContainer = document.createElement("div");
		this.readOnlyContainer.className = "container readonly";

		if (!this.setControlState(context)) {
			this.createRadio(context);
		}
	}

	private setControlState(context: ComponentFramework.Context<IInputs>): boolean {
		let isReadOnly = context.mode.isControlDisabled;
		let isMasked = false;
		if (context.parameters.optionSetValue.security) {
			isReadOnly = isReadOnly || !context.parameters.optionSetValue.security.editable;
			isMasked = !context.parameters.optionSetValue.security.readable;
		}

		if (isMasked) {
			this.radioButtonArray?.splice(0, this.radioButtonArray.length);
			this.activeContainer.remove();
			this.readOnlyContainer.innerText = "*****";
			this.container.appendChild(this.readOnlyContainer);
		} else if (isReadOnly) {
			this.radioButtonArray?.splice(0, this.radioButtonArray.length);
			this.activeContainer.remove();
			if (context.parameters.optionSetValue?.formatted != undefined || context.parameters.optionSetValue?.formatted != null) {
				this.readOnlyContainer.innerText = context.parameters.optionSetValue.formatted?.toString();
			}
			this.container.appendChild(this.readOnlyContainer);
		}

		return isMasked || isReadOnly;
	}

	private createRadio(context: ComponentFramework.Context<IInputs>) {
		this.readOnlyContainer.remove();
		var child = this.activeContainer.lastElementChild;
		
		while(child) {
			this.activeContainer.removeChild(child);
			child = this.activeContainer.lastElementChild;
		}

		this.container.appendChild(this.activeContainer);
		if (context.parameters.optionSetValue.attributes) {
			this.radioButtonArray = [];
			this.logicalName = context.parameters.optionSetValue.attributes.LogicalName;
			let options: ComponentFramework.PropertyHelper.OptionMetadata[] = context.parameters.optionSetValue.attributes.Options;

			for (var i = 0; i < options.length; i++) {
				let option = options[i];
				let divCol = document.createElement("div");
				divCol.className = "cell";

				let radio = document.createElement("input");
				radio.type = "radio";
				radio.id = option.Label;
				radio.value = option.Value.toString();
				radio.name = this.logicalName;
				radio.onclick = () => {
					this.selectedValue = Number(radio.value);
					this.notifyOutputChanged();
				};

				let label = document.createElement("label");
				label.htmlFor = radio.id;
				label.innerText = option.Label;

				this.radioButtonArray.push(radio);

				divCol.appendChild(radio);
				divCol.appendChild(label);

				this.activeContainer.appendChild(divCol);
			}

			this.container.appendChild(this.activeContainer);
		}
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		// Add code to update control view
		this.selectedValue = context.parameters.optionSetValue.raw !== null ? context.parameters.optionSetValue.raw : undefined;

		if (!this.setControlState(context)) {
			if (this.radioButtonArray.length === 0) {
				this.createRadio(context);
			}
			this.radioButtonArray.forEach((v) => v.checked = v.value === this.selectedValue?.toString());
		}
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return { optionSetValue: this.selectedValue };
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
		this.radioButtonArray?.splice(0, this.radioButtonArray.length);
	}
}