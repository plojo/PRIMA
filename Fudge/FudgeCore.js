"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FudgeCore;
(function (FudgeCore) {
    /**
     * Handles the external serialization and deserialization of [[Serializable]] objects. The internal process is handled by the objects themselves.
     * A [[Serialization]] object can be created from a [[Serializable]] object and a JSON-String may be created from that.
     * Vice versa, a JSON-String can be parsed to a [[Serialization]] which can be deserialized to a [[Serializable]] object.
     * ```plaintext
     *  [Serializable] → (serialize) → [Serialization] → (stringify)
     *                                                        ↓
     *                                                    [String]
     *                                                        ↓
     *  [Serializable] ← (deserialize) ← [Serialization] ← (parse)
     * ```
     * While the internal serialize/deserialize methods of the objects care of the selection of information needed to recreate the object and its structure,
     * the [[Serializer]] keeps track of the namespaces and classes in order to recreate [[Serializable]] objects. The general structure of a [[Serialization]] is as follows
     * ```plaintext
     * {
     *      namespaceName.className: {
     *          propertyName: propertyValue,
     *          ...,
     *          propertyNameOfReference: SerializationOfTheReferencedObject,
     *          ...,
     *          constructorNameOfSuperclass: SerializationOfSuperClass
     *      }
     * }
     * ```
     * Since the instance of the superclass is created automatically when an object is created,
     * the SerializationOfSuperClass omits the the namespaceName.className key and consists only of its value.
     * The constructorNameOfSuperclass is given instead as a property name in the serialization of the subclass.
     */
    class Serializer {
        /**
         * Registers a namespace to the [[Serializer]], to enable automatic instantiation of classes defined within
         * @param _namespace
         */
        static registerNamespace(_namespace) {
            for (let name in Serializer.namespaces)
                if (Serializer.namespaces[name] == _namespace)
                    return;
            let name = Serializer.findNamespaceIn(_namespace, window);
            if (!name)
                for (let parentName in Serializer.namespaces) {
                    name = Serializer.findNamespaceIn(_namespace, Serializer.namespaces[parentName]);
                    if (name) {
                        name = parentName + "." + name;
                        break;
                    }
                }
            if (!name)
                throw new Error("Namespace not found. Maybe parent namespace hasn't been registered before?");
            Serializer.namespaces[name] = _namespace;
        }
        /**
         * Returns a javascript object representing the serializable FUDGE-object given,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the [[Serializable]] interface
         */
        static serialize(_object) {
            let serialization = {};
            // TODO: save the namespace with the constructors name
            // serialization[_object.constructor.name] = _object.serialize();
            let path = this.getFullPath(_object);
            if (!path)
                throw new Error(`Namespace of serializable object of type ${_object.constructor.name} not found. Maybe the namespace hasn't been registered or the class not exported?`);
            serialization[path] = _object.serialize();
            return serialization;
            // return _object.serialize();
        }
        /**
         * Returns a FUDGE-object reconstructed from the information in the [[Serialization]] given,
         * including attached components, children, superclass-objects
         * @param _serialization
         */
        static deserialize(_serialization) {
            let reconstruct;
            try {
                // loop constructed solely to access type-property. Only one expected!
                for (let path in _serialization) {
                    // reconstruct = new (<General>Fudge)[typeName];
                    reconstruct = Serializer.reconstruct(path);
                    reconstruct.deserialize(_serialization[path]);
                    return reconstruct;
                }
            }
            catch (message) {
                throw new Error("Deserialization failed: " + message);
            }
            return null;
        }
        //TODO: implement prettifier to make JSON-Stringification of serializations more readable, e.g. placing x, y and z in one line
        static prettify(_json) { return _json; }
        /**
         * Returns a formatted, human readable JSON-String, representing the given [[Serializaion]] that may have been created by [[Serializer]].serialize
         * @param _serialization
         */
        static stringify(_serialization) {
            // adjustments to serialization can be made here before stringification, if desired
            let json = JSON.stringify(_serialization, null, 2);
            let pretty = Serializer.prettify(json);
            return pretty;
        }
        /**
         * Returns a [[Serialization]] created from the given JSON-String. Result may be passed to [[Serializer]].deserialize
         * @param _json
         */
        static parse(_json) {
            return JSON.parse(_json);
        }
        /**
         * Creates an object of the class defined with the full path including the namespaceName(s) and the className seperated by dots(.)
         * @param _path
         */
        static reconstruct(_path) {
            let typeName = _path.substr(_path.lastIndexOf(".") + 1);
            let namespace = Serializer.getNamespace(_path);
            if (!namespace)
                throw new Error(`Namespace of serializable object of type ${typeName} not found. Maybe the namespace hasn't been registered?`);
            let reconstruction = new namespace[typeName];
            return reconstruction;
        }
        /**
         * Returns the full path to the class of the object, if found in the registered namespaces
         * @param _object
         */
        static getFullPath(_object) {
            let typeName = _object.constructor.name;
            // Debug.log("Searching namespace of: " + typeName);
            for (let namespaceName in Serializer.namespaces) {
                let found = Serializer.namespaces[namespaceName][typeName];
                if (found && _object instanceof found)
                    return namespaceName + "." + typeName;
            }
            return null;
        }
        /**
         * Returns the namespace-object defined within the full path, if registered
         * @param _path
         */
        static getNamespace(_path) {
            let namespaceName = _path.substr(0, _path.lastIndexOf("."));
            return Serializer.namespaces[namespaceName];
        }
        /**
         * Finds the namespace-object in properties of the parent-object (e.g. window), if present
         * @param _namespace
         * @param _parent
         */
        static findNamespaceIn(_namespace, _parent) {
            for (let prop in _parent)
                if (_parent[prop] == _namespace)
                    return prop;
            return null;
        }
    }
    /** In order for the Serializer to create class instances, it needs access to the appropriate namespaces */
    Serializer.namespaces = { "ƒ": FudgeCore };
    FudgeCore.Serializer = Serializer;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Base class for all types being mutable using [[Mutator]]-objects, thus providing and using interfaces created at runtime.
     * Mutables provide a [[Mutator]] that is build by collecting all object-properties that are either of a primitive type or again Mutable.
     * Subclasses can either reduce the standard [[Mutator]] built by this base class by deleting properties or implement an individual getMutator-method.
     * The provided properties of the [[Mutator]] must match public properties or getters/setters of the object.
     * Otherwise, they will be ignored if not handled by an override of the mutate-method in the subclass and throw errors in an automatically generated user-interface for the object.
     */
    class Mutable extends EventTarget {
        /**
         * Retrieves the type of this mutable subclass as the name of the runtime class
         * @returns The type of the mutable
         */
        get type() {
            return this.constructor.name;
        }
        /**
         * Collect applicable attributes of the instance and copies of their values in a Mutator-object
         */
        getMutator() {
            let mutator = {};
            // collect primitive and mutable attributes
            for (let attribute in this) {
                let value = this[attribute];
                if (value instanceof Function)
                    continue;
                if (value instanceof Object && !(value instanceof Mutable))
                    continue;
                mutator[attribute] = this[attribute];
            }
            // mutator can be reduced but not extended!
            Object.preventExtensions(mutator);
            // delete unwanted attributes
            this.reduceMutator(mutator);
            // replace references to mutable objects with references to copies
            for (let attribute in mutator) {
                let value = mutator[attribute];
                if (value instanceof Mutable)
                    mutator[attribute] = value.getMutator();
            }
            return mutator;
        }
        /**
         * Collect the attributes of the instance and their values applicable for animation.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForAnimation() {
            return this.getMutator();
        }
        /**
         * Collect the attributes of the instance and their values applicable for the user interface.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForUserInterface() {
            return this.getMutator();
        }
        /**
         * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
         * Does not recurse into objects!
         * @param _mutator
         */
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            for (let attribute in _mutator) {
                let type = null;
                let value = _mutator[attribute];
                if (_mutator[attribute] != undefined)
                    if (typeof (value) == "object")
                        type = this[attribute].constructor.name;
                    else
                        type = _mutator[attribute].constructor.name;
                types[attribute] = type;
            }
            return types;
        }
        /**
         * Updates the values of the given mutator according to the current state of the instance
         * @param _mutator
         */
        updateMutator(_mutator) {
            for (let attribute in _mutator) {
                let value = _mutator[attribute];
                if (value instanceof Mutable)
                    value = value.getMutator();
                else
                    _mutator[attribute] = this[attribute];
            }
        }
        /**
         * Updates the attribute values of the instance according to the state of the mutator. Must be protected...!
         * @param _mutator
         */
        mutate(_mutator) {
            // TODO: don't assign unknown properties
            for (let attribute in _mutator) {
                let value = _mutator[attribute];
                let mutant = this[attribute];
                if (mutant instanceof Mutable)
                    mutant.mutate(value);
                else
                    this[attribute] = value;
            }
            this.dispatchEvent(new Event("mutate" /* MUTATE */));
        }
    }
    FudgeCore.Mutable = Mutable;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * Internally used to differentiate between the various generated structures and events.
     * @author Lukas Scheuerle, HFU, 2019
     */
    let ANIMATION_STRUCTURE_TYPE;
    (function (ANIMATION_STRUCTURE_TYPE) {
        /**Default: forward, continous */
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["NORMAL"] = 0] = "NORMAL";
        /**backward, continous */
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["REVERSE"] = 1] = "REVERSE";
        /**forward, rastered */
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["RASTERED"] = 2] = "RASTERED";
        /**backward, rastered */
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["RASTEREDREVERSE"] = 3] = "RASTEREDREVERSE";
    })(ANIMATION_STRUCTURE_TYPE || (ANIMATION_STRUCTURE_TYPE = {}));
    /**
     * Animation Class to hold all required Objects that are part of an Animation.
     * Also holds functions to play said Animation.
     * Can be added to a Node and played through [[ComponentAnimator]].
     * @author Lukas Scheuerle, HFU, 2019
     */
    class Animation extends FudgeCore.Mutable {
        constructor(_name, _animStructure = {}, _fps = 60) {
            super();
            this.totalTime = 0;
            this.labels = {};
            this.stepsPerSecond = 10;
            this.events = {};
            this.framesPerSecond = 60;
            // processed eventlist and animation strucutres for playback.
            this.eventsProcessed = new Map();
            this.animationStructuresProcessed = new Map();
            this.name = _name;
            this.animationStructure = _animStructure;
            this.animationStructuresProcessed.set(ANIMATION_STRUCTURE_TYPE.NORMAL, _animStructure);
            this.framesPerSecond = _fps;
            this.calculateTotalTime();
        }
        /**
         * Generates a new "Mutator" with the information to apply to the [[Node]] the [[ComponentAnimator]] is attached to with [[Node.applyAnimation()]].
         * @param _time The time at which the animation currently is at
         * @param _direction The direction in which the animation is supposed to be playing back. >0 == forward, 0 == stop, <0 == backwards
         * @param _playback The playbackmode the animation is supposed to be calculated with.
         * @returns a "Mutator" to apply.
         */
        getMutated(_time, _direction, _playback) {
            let m = {};
            if (_playback == FudgeCore.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
                if (_direction >= 0) {
                    m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.NORMAL), _time);
                }
                else {
                    m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.REVERSE), _time);
                }
            }
            else {
                if (_direction >= 0) {
                    m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.RASTERED), _time);
                }
                else {
                    m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE), _time);
                }
            }
            return m;
        }
        /**
         * Returns a list of the names of the events the [[ComponentAnimator]] needs to fire between _min and _max.
         * @param _min The minimum time (inclusive) to check between
         * @param _max The maximum time (exclusive) to check between
         * @param _playback The playback mode to check in. Has an effect on when the Events are fired.
         * @param _direction The direction the animation is supposed to run in. >0 == forward, 0 == stop, <0 == backwards
         * @returns a list of strings with the names of the custom events to fire.
         */
        getEventsToFire(_min, _max, _playback, _direction) {
            let eventList = [];
            let minSection = Math.floor(_min / this.totalTime);
            let maxSection = Math.floor(_max / this.totalTime);
            _min = _min % this.totalTime;
            _max = _max % this.totalTime;
            while (minSection <= maxSection) {
                let eventTriggers = this.getCorrectEventList(_direction, _playback);
                if (minSection == maxSection) {
                    eventList = eventList.concat(this.checkEventsBetween(eventTriggers, _min, _max));
                }
                else {
                    eventList = eventList.concat(this.checkEventsBetween(eventTriggers, _min, this.totalTime));
                    _min = 0;
                }
                minSection++;
            }
            return eventList;
        }
        /**
         * Adds an Event to the List of events.
         * @param _name The name of the event (needs to be unique per Animation).
         * @param _time The timestamp of the event (in milliseconds).
         */
        setEvent(_name, _time) {
            this.events[_name] = _time;
            this.eventsProcessed.clear();
        }
        /**
         * Removes the event with the given name from the list of events.
         * @param _name name of the event to remove.
         */
        removeEvent(_name) {
            delete this.events[_name];
            this.eventsProcessed.clear();
        }
        get getLabels() {
            //TODO: this actually needs testing
            let en = new Enumerator(this.labels);
            return en;
        }
        get fps() {
            return this.framesPerSecond;
        }
        set fps(_fps) {
            this.framesPerSecond = _fps;
            this.eventsProcessed.clear();
            this.animationStructuresProcessed.clear();
        }
        /**
         * (Re-)Calculate the total time of the Animation. Calculation-heavy, use only if actually needed.
         */
        calculateTotalTime() {
            this.totalTime = 0;
            this.traverseStructureForTime(this.animationStructure);
        }
        //#region transfer
        serialize() {
            let s = {
                idResource: this.idResource,
                name: this.name,
                labels: {},
                events: {},
                fps: this.framesPerSecond,
                sps: this.stepsPerSecond
            };
            for (let name in this.labels) {
                s.labels[name] = this.labels[name];
            }
            for (let name in this.events) {
                s.events[name] = this.events[name];
            }
            s.animationStructure = this.traverseStructureForSerialisation(this.animationStructure);
            return s;
        }
        deserialize(_serialization) {
            this.idResource = _serialization.idResource;
            this.name = _serialization.name;
            this.framesPerSecond = _serialization.fps;
            this.stepsPerSecond = _serialization.sps;
            this.labels = {};
            for (let name in _serialization.labels) {
                this.labels[name] = _serialization.labels[name];
            }
            this.events = {};
            for (let name in _serialization.events) {
                this.events[name] = _serialization.events[name];
            }
            this.eventsProcessed = new Map();
            this.animationStructure = this.traverseStructureForDeserialisation(_serialization.animationStructure);
            this.animationStructuresProcessed = new Map();
            this.calculateTotalTime();
            return this;
        }
        getMutator() {
            return this.serialize();
        }
        reduceMutator(_mutator) {
            delete _mutator.totalTime;
        }
        /**
         * Traverses an AnimationStructure and returns the Serialization of said Structure.
         * @param _structure The Animation Structure at the current level to transform into the Serialization.
         * @returns the filled Serialization.
         */
        traverseStructureForSerialisation(_structure) {
            let newSerialization = {};
            for (let n in _structure) {
                if (_structure[n] instanceof FudgeCore.AnimationSequence) {
                    newSerialization[n] = _structure[n].serialize();
                }
                else {
                    newSerialization[n] = this.traverseStructureForSerialisation(_structure[n]);
                }
            }
            return newSerialization;
        }
        /**
         * Traverses a Serialization to create a new AnimationStructure.
         * @param _serialization The serialization to transfer into an AnimationStructure
         * @returns the newly created AnimationStructure.
         */
        traverseStructureForDeserialisation(_serialization) {
            let newStructure = {};
            for (let n in _serialization) {
                if (_serialization[n].animationSequence) {
                    let animSeq = new FudgeCore.AnimationSequence();
                    newStructure[n] = animSeq.deserialize(_serialization[n]);
                }
                else {
                    newStructure[n] = this.traverseStructureForDeserialisation(_serialization[n]);
                }
            }
            return newStructure;
        }
        //#endregion
        /**
         * Finds the list of events to be used with these settings.
         * @param _direction The direction the animation is playing in.
         * @param _playback The playbackmode the animation is playing in.
         * @returns The correct AnimationEventTrigger Object to use
         */
        getCorrectEventList(_direction, _playback) {
            if (_playback != FudgeCore.ANIMATION_PLAYBACK.FRAMEBASED) {
                if (_direction >= 0) {
                    return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.NORMAL);
                }
                else {
                    return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.REVERSE);
                }
            }
            else {
                if (_direction >= 0) {
                    return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.RASTERED);
                }
                else {
                    return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE);
                }
            }
        }
        /**
         * Traverses an AnimationStructure to turn it into the "Mutator" to return to the Component.
         * @param _structure The strcuture to traverse
         * @param _time the point in time to write the animation numbers into.
         * @returns The "Mutator" filled with the correct values at the given time.
         */
        traverseStructureForMutator(_structure, _time) {
            let newMutator = {};
            for (let n in _structure) {
                if (_structure[n] instanceof FudgeCore.AnimationSequence) {
                    newMutator[n] = _structure[n].evaluate(_time);
                }
                else {
                    newMutator[n] = this.traverseStructureForMutator(_structure[n], _time);
                }
            }
            return newMutator;
        }
        /**
         * Traverses the current AnimationStrcuture to find the totalTime of this animation.
         * @param _structure The structure to traverse
         */
        traverseStructureForTime(_structure) {
            for (let n in _structure) {
                if (_structure[n] instanceof FudgeCore.AnimationSequence) {
                    let sequence = _structure[n];
                    if (sequence.length > 0) {
                        let sequenceTime = sequence.getKey(sequence.length - 1).Time;
                        this.totalTime = sequenceTime > this.totalTime ? sequenceTime : this.totalTime;
                    }
                }
                else {
                    this.traverseStructureForTime(_structure[n]);
                }
            }
        }
        /**
         * Ensures the existance of the requested [[AnimationStrcuture]] and returns it.
         * @param _type the type of the structure to get
         * @returns the requested [[AnimationStructure]]
         */
        getProcessedAnimationStructure(_type) {
            if (!this.animationStructuresProcessed.has(_type)) {
                this.calculateTotalTime();
                let ae = {};
                switch (_type) {
                    case ANIMATION_STRUCTURE_TYPE.NORMAL:
                        ae = this.animationStructure;
                        break;
                    case ANIMATION_STRUCTURE_TYPE.REVERSE:
                        ae = this.traverseStructureForNewStructure(this.animationStructure, this.calculateReverseSequence.bind(this));
                        break;
                    case ANIMATION_STRUCTURE_TYPE.RASTERED:
                        ae = this.traverseStructureForNewStructure(this.animationStructure, this.calculateRasteredSequence.bind(this));
                        break;
                    case ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE:
                        ae = this.traverseStructureForNewStructure(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.REVERSE), this.calculateRasteredSequence.bind(this));
                        break;
                    default:
                        return {};
                }
                this.animationStructuresProcessed.set(_type, ae);
            }
            return this.animationStructuresProcessed.get(_type);
        }
        /**
         * Ensures the existance of the requested [[AnimationEventTrigger]] and returns it.
         * @param _type The type of AnimationEventTrigger to get
         * @returns the requested [[AnimationEventTrigger]]
         */
        getProcessedEventTrigger(_type) {
            if (!this.eventsProcessed.has(_type)) {
                this.calculateTotalTime();
                let ev = {};
                switch (_type) {
                    case ANIMATION_STRUCTURE_TYPE.NORMAL:
                        ev = this.events;
                        break;
                    case ANIMATION_STRUCTURE_TYPE.REVERSE:
                        ev = this.calculateReverseEventTriggers(this.events);
                        break;
                    case ANIMATION_STRUCTURE_TYPE.RASTERED:
                        ev = this.calculateRasteredEventTriggers(this.events);
                        break;
                    case ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE:
                        ev = this.calculateRasteredEventTriggers(this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.REVERSE));
                        break;
                    default:
                        return {};
                }
                this.eventsProcessed.set(_type, ev);
            }
            return this.eventsProcessed.get(_type);
        }
        /**
         * Traverses an existing structure to apply a recalculation function to the AnimationStructure to store in a new Structure.
         * @param _oldStructure The old structure to traverse
         * @param _functionToUse The function to use to recalculated the structure.
         * @returns A new Animation Structure with the recalulated Animation Sequences.
         */
        traverseStructureForNewStructure(_oldStructure, _functionToUse) {
            let newStructure = {};
            for (let n in _oldStructure) {
                if (_oldStructure[n] instanceof FudgeCore.AnimationSequence) {
                    newStructure[n] = _functionToUse(_oldStructure[n]);
                }
                else {
                    newStructure[n] = this.traverseStructureForNewStructure(_oldStructure[n], _functionToUse);
                }
            }
            return newStructure;
        }
        /**
         * Creates a reversed Animation Sequence out of a given Sequence.
         * @param _sequence The sequence to calculate the new sequence out of
         * @returns The reversed Sequence
         */
        calculateReverseSequence(_sequence) {
            let seq = new FudgeCore.AnimationSequence();
            for (let i = 0; i < _sequence.length; i++) {
                let oldKey = _sequence.getKey(i);
                let key = new FudgeCore.AnimationKey(this.totalTime - oldKey.Time, oldKey.Value, oldKey.SlopeOut, oldKey.SlopeIn, oldKey.Constant);
                seq.addKey(key);
            }
            return seq;
        }
        /**
         * Creates a rastered [[AnimationSequence]] out of a given sequence.
         * @param _sequence The sequence to calculate the new sequence out of
         * @returns the rastered sequence.
         */
        calculateRasteredSequence(_sequence) {
            let seq = new FudgeCore.AnimationSequence();
            let frameTime = 1000 / this.framesPerSecond;
            for (let i = 0; i < this.totalTime; i += frameTime) {
                let key = new FudgeCore.AnimationKey(i, _sequence.evaluate(i), 0, 0, true);
                seq.addKey(key);
            }
            return seq;
        }
        /**
         * Creates a new reversed [[AnimationEventTrigger]] object based on the given one.
         * @param _events the event object to calculate the new one out of
         * @returns the reversed event object
         */
        calculateReverseEventTriggers(_events) {
            let ae = {};
            for (let name in _events) {
                ae[name] = this.totalTime - _events[name];
            }
            return ae;
        }
        /**
         * Creates a rastered [[AnimationEventTrigger]] object based on the given one.
         * @param _events the event object to calculate the new one out of
         * @returns the rastered event object
         */
        calculateRasteredEventTriggers(_events) {
            let ae = {};
            let frameTime = 1000 / this.framesPerSecond;
            for (let name in _events) {
                ae[name] = _events[name] - (_events[name] % frameTime);
            }
            return ae;
        }
        /**
         * Checks which events lay between two given times and returns the names of the ones that do.
         * @param _eventTriggers The event object to check the events inside of
         * @param _min the minimum of the range to check between (inclusive)
         * @param _max the maximum of the range to check between (exclusive)
         * @returns an array of the names of the events in the given range.
         */
        checkEventsBetween(_eventTriggers, _min, _max) {
            let eventsToTrigger = [];
            for (let name in _eventTriggers) {
                if (_min <= _eventTriggers[name] && _eventTriggers[name] < _max) {
                    eventsToTrigger.push(name);
                }
            }
            return eventsToTrigger;
        }
    }
    FudgeCore.Animation = Animation;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * Calculates the values between [[AnimationKey]]s.
     * Represented internally by a cubic function (`f(x) = ax³ + bx² + cx + d`).
     * Only needs to be recalculated when the keys change, so at runtime it should only be calculated once.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class AnimationFunction {
        constructor(_keyIn, _keyOut = null) {
            this.a = 0;
            this.b = 0;
            this.c = 0;
            this.d = 0;
            this.keyIn = _keyIn;
            this.keyOut = _keyOut;
            this.calculate();
        }
        /**
         * Calculates the value of the function at the given time.
         * @param _time the point in time at which to evaluate the function in milliseconds. Will be corrected for offset internally.
         * @returns the value at the given time
         */
        evaluate(_time) {
            _time -= this.keyIn.Time;
            let time2 = _time * _time;
            let time3 = time2 * _time;
            return this.a * time3 + this.b * time2 + this.c * _time + this.d;
        }
        set setKeyIn(_keyIn) {
            this.keyIn = _keyIn;
            this.calculate();
        }
        set setKeyOut(_keyOut) {
            this.keyOut = _keyOut;
            this.calculate();
        }
        /**
         * (Re-)Calculates the parameters of the cubic function.
         * See https://math.stackexchange.com/questions/3173469/calculate-cubic-equation-from-two-points-and-two-slopes-variably
         * and https://jirkadelloro.github.io/FUDGE/Documentation/Logs/190410_Notizen_LS
         */
        calculate() {
            if (!this.keyIn) {
                this.d = this.c = this.b = this.a = 0;
                return;
            }
            if (!this.keyOut || this.keyIn.Constant) {
                this.d = this.keyIn.Value;
                this.c = this.b = this.a = 0;
                return;
            }
            let x1 = this.keyOut.Time - this.keyIn.Time;
            this.d = this.keyIn.Value;
            this.c = this.keyIn.SlopeOut;
            this.a = (-x1 * (this.keyIn.SlopeOut + this.keyOut.SlopeIn) - 2 * this.keyIn.Value + 2 * this.keyOut.Value) / -Math.pow(x1, 3);
            this.b = (this.keyOut.SlopeIn - this.keyIn.SlopeOut - 3 * this.a * Math.pow(x1, 2)) / (2 * x1);
        }
    }
    FudgeCore.AnimationFunction = AnimationFunction;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * Holds information about set points in time, their accompanying values as well as their slopes.
     * Also holds a reference to the [[AnimationFunction]]s that come in and out of the sides. The [[AnimationFunction]]s are handled by the [[AnimationSequence]]s.
     * Saved inside an [[AnimationSequence]].
     * @author Lukas Scheuerle, HFU, 2019
     */
    class AnimationKey extends FudgeCore.Mutable {
        constructor(_time = 0, _value = 0, _slopeIn = 0, _slopeOut = 0, _constant = false) {
            super();
            this.constant = false;
            this.slopeIn = 0;
            this.slopeOut = 0;
            this.time = _time;
            this.value = _value;
            this.slopeIn = _slopeIn;
            this.slopeOut = _slopeOut;
            this.constant = _constant;
            this.broken = this.slopeIn != -this.slopeOut;
            this.functionOut = new FudgeCore.AnimationFunction(this, null);
        }
        get Time() {
            return this.time;
        }
        set Time(_time) {
            this.time = _time;
            this.functionIn.calculate();
            this.functionOut.calculate();
        }
        get Value() {
            return this.value;
        }
        set Value(_value) {
            this.value = _value;
            this.functionIn.calculate();
            this.functionOut.calculate();
        }
        get Constant() {
            return this.constant;
        }
        set Constant(_constant) {
            this.constant = _constant;
            this.functionIn.calculate();
            this.functionOut.calculate();
        }
        get SlopeIn() {
            return this.slopeIn;
        }
        set SlopeIn(_slope) {
            this.slopeIn = _slope;
            this.functionIn.calculate();
        }
        get SlopeOut() {
            return this.slopeOut;
        }
        set SlopeOut(_slope) {
            this.slopeOut = _slope;
            this.functionOut.calculate();
        }
        /**
         * Static comparation function to use in an array sort function to sort the keys by their time.
         * @param _a the animation key to check
         * @param _b the animation key to check against
         * @returns >0 if a>b, 0 if a=b, <0 if a<b
         */
        static compare(_a, _b) {
            return _a.time - _b.time;
        }
        //#region transfer
        serialize() {
            let s = {};
            s.time = this.time;
            s.value = this.value;
            s.slopeIn = this.slopeIn;
            s.slopeOut = this.slopeOut;
            s.constant = this.constant;
            return s;
        }
        deserialize(_serialization) {
            this.time = _serialization.time;
            this.value = _serialization.value;
            this.slopeIn = _serialization.slopeIn;
            this.slopeOut = _serialization.slopeOut;
            this.constant = _serialization.constant;
            this.broken = this.slopeIn != -this.slopeOut;
            return this;
        }
        getMutator() {
            return this.serialize();
        }
        reduceMutator(_mutator) {
            //
        }
    }
    FudgeCore.AnimationKey = AnimationKey;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * A sequence of [[AnimationKey]]s that is mapped to an attribute of a [[Node]] or its [[Component]]s inside the [[Animation]].
     * Provides functions to modify said keys
     * @author Lukas Scheuerle, HFU, 2019
     */
    class AnimationSequence extends FudgeCore.Mutable {
        constructor() {
            super(...arguments);
            this.keys = [];
        }
        /**
         * Evaluates the sequence at the given point in time.
         * @param _time the point in time at which to evaluate the sequence in milliseconds.
         * @returns the value of the sequence at the given time. 0 if there are no keys.
         */
        evaluate(_time) {
            if (this.keys.length == 0)
                return 0; //TODO: shouldn't return 0 but something indicating no change, like null. probably needs to be changed in Node as well to ignore non-numeric values in the applyAnimation function
            if (this.keys.length == 1 || this.keys[0].Time >= _time)
                return this.keys[0].Value;
            for (let i = 0; i < this.keys.length - 1; i++) {
                if (this.keys[i].Time <= _time && this.keys[i + 1].Time > _time) {
                    return this.keys[i].functionOut.evaluate(_time);
                }
            }
            return this.keys[this.keys.length - 1].Value;
        }
        /**
         * Adds a new key to the sequence.
         * @param _key the key to add
         */
        addKey(_key) {
            this.keys.push(_key);
            this.keys.sort(FudgeCore.AnimationKey.compare);
            this.regenerateFunctions();
        }
        /**
         * Removes a given key from the sequence.
         * @param _key the key to remove
         */
        removeKey(_key) {
            for (let i = 0; i < this.keys.length; i++) {
                if (this.keys[i] == _key) {
                    this.keys.splice(i, 1);
                    this.regenerateFunctions();
                    return;
                }
            }
        }
        /**
         * Removes the Animation Key at the given index from the keys.
         * @param _index the zero-based index at which to remove the key
         * @returns the removed AnimationKey if successful, null otherwise.
         */
        removeKeyAtIndex(_index) {
            if (_index < 0 || _index >= this.keys.length) {
                return null;
            }
            let ak = this.keys[_index];
            this.keys.splice(_index, 1);
            this.regenerateFunctions();
            return ak;
        }
        /**
         * Gets a key from the sequence at the desired index.
         * @param _index the zero-based index at which to get the key
         * @returns the AnimationKey at the index if it exists, null otherwise.
         */
        getKey(_index) {
            if (_index < 0 || _index >= this.keys.length)
                return null;
            return this.keys[_index];
        }
        get length() {
            return this.keys.length;
        }
        //#region transfer
        serialize() {
            let s = {
                keys: [],
                animationSequence: true
            };
            for (let i = 0; i < this.keys.length; i++) {
                s.keys[i] = this.keys[i].serialize();
            }
            return s;
        }
        deserialize(_serialization) {
            for (let i = 0; i < _serialization.keys.length; i++) {
                // this.keys.push(<AnimationKey>Serializer.deserialize(_serialization.keys[i]));
                let k = new FudgeCore.AnimationKey();
                k.deserialize(_serialization.keys[i]);
                this.keys[i] = k;
            }
            this.regenerateFunctions();
            return this;
        }
        reduceMutator(_mutator) {
            //
        }
        //#endregion
        /**
         * Utility function that (re-)generates all functions in the sequence.
         */
        regenerateFunctions() {
            for (let i = 0; i < this.keys.length; i++) {
                let f = new FudgeCore.AnimationFunction(this.keys[i]);
                this.keys[i].functionOut = f;
                if (i == this.keys.length - 1) {
                    //TODO: check if this is even useful. Maybe update the runcondition to length - 1 instead. Might be redundant if functionIn is removed, see TODO in AnimationKey.
                    f.setKeyOut = this.keys[0];
                    this.keys[0].functionIn = f;
                    break;
                }
                f.setKeyOut = this.keys[i + 1];
                this.keys[i + 1].functionIn = f;
            }
        }
    }
    FudgeCore.AnimationSequence = AnimationSequence;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Describes the [[Audio]] class in which all Audio Data is stored.
     * Audio will be given to the [[ComponentAudio]] for further usage.
     * @authors Thomas Dorner, HFU, 2019
     */
    class Audio {
        /**
         * Constructor for the [[Audio]] Class
         * @param _audioContext from [[AudioSettings]]
         * @param _gainValue 0 for muted | 1 for max volume
         */
        constructor(_audioContext, _audioSessionData, _url, _gainValue, _loop) {
            this.init(_audioContext, _audioSessionData, _url, _gainValue, _loop);
        }
        async init(_audioContext, _audioSessionData, _url, _gainValue, _loop) {
            // Do everything in constructor
            // Add url to Audio
            this.url = _url;
            console.log("Audio url " + this.url);
            // Get AudioBuffer
            const bufferProm = _audioSessionData.urlToBuffer(_audioContext, _url);
            while (!bufferProm) {
                console.log("waiting...");
            }
            await bufferProm.then(val => {
                this.audioBuffer = val;
                console.log("valBuffer " + val);
            });
            console.log("Audio audiobuffer " + this.audioBuffer);
            // // Add local Gain for Audio  and connect 
            this.localGain = await _audioContext.createGain();
            this.localGainValue = await _gainValue;
            //create Audio
            await this.createAudio(_audioContext, this.audioBuffer);
        }
        /**
         * initBufferSource
         */
        initBufferSource(_audioContext) {
            this.bufferSource = _audioContext.createBufferSource();
            this.bufferSource.buffer = this.audioBuffer;
            console.log("bS = " + this.bufferSource);
            this.bufferSource.connect(_audioContext.destination);
            this.setLoop();
            this.addLocalGain();
            console.log("BufferSource.buffer: " + this.bufferSource.buffer);
            console.log("AudioBuffer: " + this.audioBuffer);
        }
        //#region Getter/Setter LocalGainValue
        setLocalGainValue(_localGainValue) {
            this.localGainValue = _localGainValue;
        }
        getLocalGainValue() {
            return this.localGainValue;
        }
        //#endregion Getter/Setter LocalGainValue
        setBufferSource(_buffer) {
            this.bufferSource.buffer = _buffer;
        }
        /**
         * createAudio builds an [[Audio]] to use with the [[ComponentAudio]]
         * @param _audioContext from [[AudioSettings]]
         * @param _audioBuffer from [[AudioSessionData]]
         */
        createAudio(_audioContext, _audioBuffer) {
            console.log("createAudio() " + " | " + " AudioContext: " + _audioContext);
            this.audioBuffer = _audioBuffer;
            console.log("aB = " + this.audioBuffer);
            // AudioBuffersourceNode Setup
            this.initBufferSource(_audioContext);
            return this.audioBuffer;
        }
        setLoop() {
            this.bufferSource.loop = this.isLooping;
        }
        addLocalGain() {
            this.bufferSource.connect(this.localGain);
        }
    }
    FudgeCore.Audio = Audio;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Add an [[AudioFilter]] to an [[Audio]]
     * @authors Thomas Dorner, HFU, 2019
     */
    let FILTER_TYPE;
    (function (FILTER_TYPE) {
        FILTER_TYPE["LOWPASS"] = "LOWPASS";
        FILTER_TYPE["HIGHPASS"] = "HIGHPASS";
        FILTER_TYPE["BANDPASS"] = "BANDPASS";
        FILTER_TYPE["LOWSHELF"] = "LOWSHELF";
        FILTER_TYPE["HIGHSHELF"] = "HIGHSHELF";
        FILTER_TYPE["PEAKING"] = "PEAKING";
        FILTER_TYPE["NOTCH"] = "NOTCH";
        FILTER_TYPE["ALLPASS"] = "ALLPASS";
    })(FILTER_TYPE || (FILTER_TYPE = {}));
    class AudioFilter {
        constructor(_useFilter, _filterType) {
            this.useFilter = _useFilter;
            this.filterType = _filterType;
        }
        /**
         * addFilterTo
         */
        addFilterToAudio(_audioBuffer, _filterType) {
            console.log("do nothing for now");
        }
    }
    FudgeCore.AudioFilter = AudioFilter;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Describes a [[AudioListener]] attached to a [[Node]]
     * @authors Thomas Dorner, HFU, 2019
     */
    class AudioListener {
        //##TODO AudioListener
        constructor(_audioContext) {
            //this.audioListener = _audioContext.listener;
        }
        /**
         * We will call setAudioListenerPosition whenever there is a need to change Positions.
         * All the position values should be identical to the current Position this is atteched to.
         */
        // public setAudioListenerPosition(_position: Vector3): void {
        //     this.audioListener.positionX.value = _position.x;
        //     this.audioListener.positionY.value = _position.y;
        //     this.audioListener.positionZ.value = _position.z;
        //     this.position = _position;
        // }
        /**
         * getAudioListenerPosition
         */
        getAudioListenerPosition() {
            return this.position;
        }
        /**
         * setAudioListenerOrientation
         */
        // public setAudioListenerOrientation(_orientation: Vector3): void {
        //     this.audioListener.orientationX.value = _orientation.x;
        //     this.audioListener.orientationY.value = _orientation.y;
        //     this.audioListener.orientationZ.value = _orientation.z;
        //     this.orientation = _orientation;
        // }
        /**
         * getAudioListenerOrientation
         */
        getAudioListenerOrientation() {
            return this.orientation;
        }
    }
    FudgeCore.AudioListener = AudioListener;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     *
     * @authors Thomas Dorner, HFU, 2019
     */
    let PANNING_MODEL_TYPE;
    (function (PANNING_MODEL_TYPE) {
        PANNING_MODEL_TYPE["EQUALPOWER"] = "EQUALPOWER";
        PANNING_MODEL_TYPE["HRFT"] = "HRFT";
    })(PANNING_MODEL_TYPE || (PANNING_MODEL_TYPE = {}));
    let DISTANCE_MODEL_TYPE;
    (function (DISTANCE_MODEL_TYPE) {
        DISTANCE_MODEL_TYPE["LINEAR"] = "LINEAR";
        DISTANCE_MODEL_TYPE["INVERSE"] = "INVERSE";
        DISTANCE_MODEL_TYPE["EXPONENTIAL"] = "EXPONENTIAL";
    })(DISTANCE_MODEL_TYPE || (DISTANCE_MODEL_TYPE = {}));
    class AudioLocalisation {
        /**
         * Constructor for the [[AudioLocalisation]] Class
         * @param _audioContext from [[AudioSettings]]
         */
        constructor(_audioContext) {
            this.pannerNode = _audioContext.createPanner();
        }
        /**
        * We will call setPannerPosition whenever there is a need to change Positions.
        * All the position values should be identical to the current Position this is atteched to.
        */
        // public setPannePosition(_position: Vector3): void {
        //     this.pannerNode.positionX.value = _position.x;
        //     this.pannerNode.positionY.value = _position.y;
        //     this.pannerNode.positionZ.value = _position.z;
        //     this.position = _position;
        // }
        /**
         * getPannerPosition
         */
        getPannerPosition() {
            return this.position;
        }
        /**
         * setPanneOrientation
         */
        // public setPannerOrientation(_orientation: Vector3): void {
        //     this.pannerNode.orientationX.value = _orientation.x;
        //     this.pannerNode.orientationY.value = _orientation.y;
        //     this.pannerNode.orientationZ.value = _orientation.z;
        //     this.orientation = _orientation;
        // }
        /**
         * getPanneOrientation
         */
        getPanneOrientation() {
            return this.orientation;
        }
    }
    FudgeCore.AudioLocalisation = AudioLocalisation;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Describes Data Handler for all Audio Sources
     * @authors Thomas Dorner, HFU, 2019
     */
    class AudioSessionData {
        /**
         * constructor of the [[AudioSessionData]] class
         */
        constructor() {
            this.dataArray = new Array();
            this.bufferCounter = 0;
        }
        /**
         * getBufferCounter returns [bufferCounter] to keep track of number of different used sounds
         */
        getBufferCounter() {
            return this.bufferCounter;
        }
        /**
         * Decoding Audio Data
         * Asynchronous Function to permit the loading of multiple Data Sources at the same time
         * @param _url URL as String for Data fetching
         */
        async urlToBuffer(_audioContext, _url) {
            console.log("inside urlToBuffer");
            let initObject = {
                method: "GET",
                mode: "same-origin",
                cache: "no-cache",
                headers: {
                    "Content-Type": "audio/mpeg3"
                },
                redirect: "follow" // default -> follow
            };
            // Check for existing URL in DataArray, if no data inside add new AudioData
            //this.pushDataArray(_url, null);
            console.log("length" + this.dataArray.length);
            if (this.dataArray.length == 0) {
                try {
                    // need window to fetch?
                    const response = await window.fetch(_url, initObject);
                    const arrayBuffer = await response.arrayBuffer();
                    const decodedAudio = await _audioContext.decodeAudioData(arrayBuffer);
                    this.pushDataArray(_url, decodedAudio);
                    //this.dataArray[this.dataArray.length].buffer = decodedAudio;
                    console.log("length " + this.dataArray.length);
                    return decodedAudio;
                }
                catch (e) {
                    this.logErrorFetch(e);
                    return null;
                }
            }
            else {
                // If needed URL is inside Array, 
                // iterate through all existing Data to get needed values
                for (let x = 0; x < this.dataArray.length; x++) {
                    console.log("what is happening");
                    if (this.dataArray[x].url == _url) {
                        console.log("found existing url");
                        return this.dataArray[x].buffer;
                    }
                }
                return null;
            }
        }
        /**
         * pushTuple Source and Decoded Audio Data gets saved for later use
         * @param _url URL from used Data
         * @param _audioBuffer AudioBuffer generated from URL
         */
        pushDataArray(_url, _audioBuffer) {
            let data;
            data = { url: _url, buffer: _audioBuffer, counter: this.bufferCounter };
            this.dataArray.push(data);
            console.log("array: " + this.dataArray);
            //TODO audioBufferHolder obsolete if array working
            this.setAudioBufferHolder(data);
            console.log("dataPair " + data.url + " " + data.buffer + " " + data.counter);
            this.bufferCounter += 1;
            return this.audioBufferHolder;
        }
        /**
         * iterateArray
         * Look at saved Data Count
         */
        countDataInArray() {
            console.log("DataArray Length: " + this.dataArray.length);
        }
        /**
         * showDataInArray
         * Show all Data in Array
         */
        showDataInArray() {
            for (let x = 0; x < this.dataArray.length; x++) {
                console.log("Array Data: " + this.dataArray[x].url + this.dataArray[x].buffer);
            }
        }
        /**
         * getAudioBuffer
         */
        getAudioBufferHolder() {
            return this.audioBufferHolder;
        }
        /**
         * setAudioBuffer
         */
        setAudioBufferHolder(_audioData) {
            this.audioBufferHolder = _audioData;
        }
        /**
         * Error Message for Data Fetching
         * @param e Error
         */
        logErrorFetch(e) {
            console.log("Audio error", e);
        }
    }
    FudgeCore.AudioSessionData = AudioSessionData;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Describes Global Audio Settings.
     * Is meant to be used as a Menu option.
     * @authors Thomas Dorner, HFU, 2019
     */
    class AudioSettings {
        //
        /**
         * Constructor for master Volume
         * @param _gainValue
         */
        constructor(_gainValue) {
            this.setAudioContext(new AudioContext({ latencyHint: "interactive", sampleRate: 44100 }));
            //this.globalAudioContext.resume();
            console.log("GlobalAudioContext: " + this.globalAudioContext);
            this.masterGain = this.globalAudioContext.createGain();
            this.masterGainValue = _gainValue;
            //this.audioSessionData = new AudioSessionData();
        }
        setMasterGainValue(_masterGainValue) {
            this.masterGainValue = _masterGainValue;
        }
        getMasterGainValue() {
            return this.masterGainValue;
        }
        getAudioContext() {
            return this.globalAudioContext;
        }
        setAudioContext(_audioContext) {
            this.globalAudioContext = _audioContext;
        }
    }
    FudgeCore.AudioSettings = AudioSettings;
})(FudgeCore || (FudgeCore = {}));
//<reference path="../Coats/Coat.ts"/>
var FudgeCore;
//<reference path="../Coats/Coat.ts"/>
(function (FudgeCore) {
    class RenderInjector {
        static decorateCoat(_constructor) {
            let coatInjection = RenderInjector.coatInjections[_constructor.name];
            if (!coatInjection) {
                FudgeCore.Debug.error("No injection decorator defined for " + _constructor.name);
            }
            Object.defineProperty(_constructor.prototype, "useRenderData", {
                value: coatInjection
            });
        }
        static injectRenderDataForCoatColored(_renderShader) {
            let colorUniformLocation = _renderShader.uniforms["u_color"];
            // let { r, g, b, a } = (<CoatColored>this).color;
            // let color: Float32Array = new Float32Array([r, g, b, a]);
            let color = this.color.getArray();
            FudgeCore.RenderOperator.getRenderingContext().uniform4fv(colorUniformLocation, color);
        }
        static injectRenderDataForCoatTextured(_renderShader) {
            let crc3 = FudgeCore.RenderOperator.getRenderingContext();
            if (this.renderData) {
                // buffers exist
                crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
                crc3.uniform1i(_renderShader.uniforms["u_texture"], 0);
            }
            else {
                this.renderData = {};
                // TODO: check if all WebGL-Creations are asserted
                const texture = FudgeCore.RenderManager.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                try {
                    crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, this.texture.image);
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.texture.image);
                }
                catch (_e) {
                    FudgeCore.Debug.error(_e);
                }
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.generateMipmap(crc3.TEXTURE_2D);
                this.renderData["texture0"] = texture;
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                this.useRenderData(_renderShader);
            }
        }
        static injectRenderDataForCoatMatCap(_renderShader) {
            let crc3 = FudgeCore.RenderOperator.getRenderingContext();
            let colorUniformLocation = _renderShader.uniforms["u_tint_color"];
            let { r, g, b, a } = this.tintColor;
            let tintColorArray = new Float32Array([r, g, b, a]);
            crc3.uniform4fv(colorUniformLocation, tintColorArray);
            let floatUniformLocation = _renderShader.uniforms["u_flatmix"];
            let flatMix = this.flatMix;
            crc3.uniform1f(floatUniformLocation, flatMix);
            if (this.renderData) {
                // buffers exist
                crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
                crc3.uniform1i(_renderShader.uniforms["u_texture"], 0);
            }
            else {
                this.renderData = {};
                // TODO: check if all WebGL-Creations are asserted
                const texture = FudgeCore.RenderManager.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                try {
                    crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, this.texture.image);
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.texture.image);
                }
                catch (_e) {
                    FudgeCore.Debug.error(_e);
                }
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.generateMipmap(crc3.TEXTURE_2D);
                this.renderData["texture0"] = texture;
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                this.useRenderData(_renderShader);
            }
        }
    }
    RenderInjector.coatInjections = {
        "CoatColored": RenderInjector.injectRenderDataForCoatColored,
        "CoatTextured": RenderInjector.injectRenderDataForCoatTextured,
        "CoatMatCap": RenderInjector.injectRenderDataForCoatMatCap
    };
    FudgeCore.RenderInjector = RenderInjector;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
     * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
     */
    class RenderOperator {
        /**
        * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
        * @param _value // value to check against null
        * @param _message // optional, additional message for the exception
        */
        static assert(_value, _message = "") {
            if (_value === null)
                throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${RenderOperator.crc3 ? RenderOperator.crc3.getError() : ""}`);
            return _value;
        }
        /**
         * Initializes offscreen-canvas, renderingcontext and hardware viewport.
         */
        static initialize(_antialias = false, _alpha = false) {
            let contextAttributes = { alpha: _alpha, antialias: _antialias };
            let canvas = document.createElement("canvas");
            RenderOperator.crc3 = RenderOperator.assert(canvas.getContext("webgl2", contextAttributes), "WebGL-context couldn't be created");
            // Enable backface- and zBuffer-culling.
            RenderOperator.crc3.enable(WebGL2RenderingContext.CULL_FACE);
            RenderOperator.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
            // RenderOperator.crc3.pixelStorei(WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL, true);
            RenderOperator.rectViewport = RenderOperator.getCanvasRect();
            RenderOperator.renderShaderRayCast = RenderOperator.createProgram(FudgeCore.ShaderRayCast);
        }
        /**
         * Return a reference to the offscreen-canvas
         */
        static getCanvas() {
            return RenderOperator.crc3.canvas; // TODO: enable OffscreenCanvas
        }
        /**
         * Return a reference to the rendering context
         */
        static getRenderingContext() {
            return RenderOperator.crc3;
        }
        /**
         * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
         */
        static getCanvasRect() {
            let canvas = RenderOperator.crc3.canvas;
            return FudgeCore.Rectangle.GET(0, 0, canvas.width, canvas.height);
        }
        /**
         * Set the size of the offscreen-canvas.
         */
        static setCanvasSize(_width, _height) {
            RenderOperator.crc3.canvas.width = _width;
            RenderOperator.crc3.canvas.height = _height;
        }
        /**
         * Set the area on the offscreen-canvas to render the camera image to.
         * @param _rect
         */
        static setViewportRectangle(_rect) {
            Object.assign(RenderOperator.rectViewport, _rect);
            RenderOperator.crc3.viewport(_rect.x, _rect.y, _rect.width, _rect.height);
        }
        /**
         * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
         */
        static getViewportRectangle() {
            return RenderOperator.rectViewport;
        }
        /**
         * Convert light data to flat arrays
         * TODO: this method appears to be obsolete...?
         */
        static createRenderLights(_lights) {
            let renderLights = {};
            for (let entry of _lights) {
                // TODO: simplyfy, since direction is now handled by ComponentLight
                switch (entry[0]) {
                    case FudgeCore.LightAmbient.name:
                        let ambient = [];
                        for (let cmpLight of entry[1]) {
                            let c = cmpLight.light.color;
                            ambient.push(c.r, c.g, c.b, c.a);
                        }
                        renderLights["u_ambient"] = new Float32Array(ambient);
                        break;
                    case FudgeCore.LightDirectional.name:
                        let directional = [];
                        for (let cmpLight of entry[1]) {
                            let c = cmpLight.light.color;
                            // let d: Vector3 = (<LightDirectional>light.getLight()).direction;
                            directional.push(c.r, c.g, c.b, c.a, 0, 0, 1);
                        }
                        renderLights["u_directional"] = new Float32Array(directional);
                        break;
                    default:
                        FudgeCore.Debug.warn("Shaderstructure undefined for", entry[0]);
                }
            }
            return renderLights;
        }
        /**
         * Set light data in shaders
         */
        static setLightsInShader(_renderShader, _lights) {
            RenderOperator.useProgram(_renderShader);
            let uni = _renderShader.uniforms;
            let ambient = uni["u_ambient.color"];
            if (ambient) {
                let cmpLights = _lights.get("LightAmbient");
                if (cmpLights) {
                    // TODO: add up ambient lights to a single color
                    // let result: Color = new Color(0, 0, 0, 1);
                    for (let cmpLight of cmpLights)
                        // for now, only the last is relevant
                        RenderOperator.crc3.uniform4fv(ambient, cmpLight.light.color.getArray());
                }
            }
            let nDirectional = uni["u_nLightsDirectional"];
            if (nDirectional) {
                let cmpLights = _lights.get("LightDirectional");
                if (cmpLights) {
                    let n = cmpLights.length;
                    RenderOperator.crc3.uniform1ui(nDirectional, n);
                    for (let i = 0; i < n; i++) {
                        let cmpLight = cmpLights[i];
                        RenderOperator.crc3.uniform4fv(uni[`u_directional[${i}].color`], cmpLight.light.color.getArray());
                        let direction = FudgeCore.Vector3.Z();
                        direction.transform(cmpLight.pivot);
                        direction.transform(cmpLight.getContainer().mtxWorld);
                        RenderOperator.crc3.uniform3fv(uni[`u_directional[${i}].direction`], direction.get());
                    }
                }
            }
            // debugger;
        }
        /**
         * Draw a mesh buffer using the given infos and the complete projection matrix
         * @param _renderShader
         * @param _renderBuffers
         * @param _renderCoat
         * @param _world
         * @param _projection
         */
        static draw(_renderShader, _renderBuffers, _renderCoat, _world, _projection) {
            RenderOperator.useProgram(_renderShader);
            // RenderOperator.useBuffers(_renderBuffers);
            // RenderOperator.useParameter(_renderCoat);
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_position"]);
            RenderOperator.setAttributeStructure(_renderShader.attributes["a_position"], FudgeCore.Mesh.getBufferSpecification());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);
            if (_renderShader.attributes["a_textureUVs"]) {
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.textureUVs);
                RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_textureUVs"]); // enable the buffer
                RenderOperator.crc3.vertexAttribPointer(_renderShader.attributes["a_textureUVs"], 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
            }
            // Supply matrixdata to shader. 
            let uProjection = _renderShader.uniforms["u_projection"];
            RenderOperator.crc3.uniformMatrix4fv(uProjection, false, _projection.get());
            if (_renderShader.uniforms["u_world"]) {
                let uWorld = _renderShader.uniforms["u_world"];
                RenderOperator.crc3.uniformMatrix4fv(uWorld, false, _world.get());
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.normalsFace);
                RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_normal"]);
                RenderOperator.setAttributeStructure(_renderShader.attributes["a_normal"], FudgeCore.Mesh.getBufferSpecification());
            }
            // TODO: this is all that's left of coat handling in RenderOperator, due to injection. So extra reference from node to coat is unnecessary
            _renderCoat.coat.useRenderData(_renderShader);
            // Draw call
            // RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, Mesh.getBufferSpecification().offset, _renderBuffers.nIndices);
            RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }
        /**
         * Draw a buffer with a special shader that uses an id instead of a color
         * @param _renderShader
         * @param _renderBuffers
         * @param _world
         * @param _projection
         */
        static drawForRayCast(_id, _renderBuffers, _world, _projection) {
            let renderShader = RenderOperator.renderShaderRayCast;
            RenderOperator.useProgram(renderShader);
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            RenderOperator.crc3.enableVertexAttribArray(renderShader.attributes["a_position"]);
            RenderOperator.setAttributeStructure(renderShader.attributes["a_position"], FudgeCore.Mesh.getBufferSpecification());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);
            // Supply matrixdata to shader. 
            let uProjection = renderShader.uniforms["u_projection"];
            RenderOperator.crc3.uniformMatrix4fv(uProjection, false, _projection.get());
            if (renderShader.uniforms["u_world"]) {
                let uWorld = renderShader.uniforms["u_world"];
                RenderOperator.crc3.uniformMatrix4fv(uWorld, false, _world.get());
            }
            let idUniformLocation = renderShader.uniforms["u_id"];
            RenderOperator.getRenderingContext().uniform1i(idUniformLocation, _id);
            RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }
        // #region Shaderprogram 
        static createProgram(_shaderClass) {
            let crc3 = RenderOperator.crc3;
            let program = crc3.createProgram();
            let renderShader;
            try {
                crc3.attachShader(program, RenderOperator.assert(compileShader(_shaderClass.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER)));
                crc3.attachShader(program, RenderOperator.assert(compileShader(_shaderClass.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER)));
                crc3.linkProgram(program);
                let error = RenderOperator.assert(crc3.getProgramInfoLog(program));
                if (error !== "") {
                    throw new Error("Error linking Shader: " + error);
                }
                renderShader = {
                    program: program,
                    attributes: detectAttributes(),
                    uniforms: detectUniforms()
                };
            }
            catch (_error) {
                FudgeCore.Debug.error(_error);
                debugger;
            }
            return renderShader;
            function compileShader(_shaderCode, _shaderType) {
                let webGLShader = crc3.createShader(_shaderType);
                crc3.shaderSource(webGLShader, _shaderCode);
                crc3.compileShader(webGLShader);
                let error = RenderOperator.assert(crc3.getShaderInfoLog(webGLShader));
                if (error !== "") {
                    throw new Error("Error compiling shader: " + error);
                }
                // Check for any compilation errors.
                if (!crc3.getShaderParameter(webGLShader, WebGL2RenderingContext.COMPILE_STATUS)) {
                    alert(crc3.getShaderInfoLog(webGLShader));
                    return null;
                }
                return webGLShader;
            }
            function detectAttributes() {
                let detectedAttributes = {};
                let attributeCount = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
                for (let i = 0; i < attributeCount; i++) {
                    let attributeInfo = RenderOperator.assert(crc3.getActiveAttrib(program, i));
                    if (!attributeInfo) {
                        break;
                    }
                    detectedAttributes[attributeInfo.name] = crc3.getAttribLocation(program, attributeInfo.name);
                }
                return detectedAttributes;
            }
            function detectUniforms() {
                let detectedUniforms = {};
                let uniformCount = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_UNIFORMS);
                for (let i = 0; i < uniformCount; i++) {
                    let info = RenderOperator.assert(crc3.getActiveUniform(program, i));
                    if (!info) {
                        break;
                    }
                    detectedUniforms[info.name] = RenderOperator.assert(crc3.getUniformLocation(program, info.name));
                }
                return detectedUniforms;
            }
        }
        static useProgram(_shaderInfo) {
            RenderOperator.crc3.useProgram(_shaderInfo.program);
            RenderOperator.crc3.enableVertexAttribArray(_shaderInfo.attributes["a_position"]);
        }
        static deleteProgram(_program) {
            if (_program) {
                RenderOperator.crc3.deleteProgram(_program.program);
                delete _program.attributes;
                delete _program.uniforms;
            }
        }
        // #endregion
        // #region Meshbuffer
        static createBuffers(_mesh) {
            let vertices = RenderOperator.assert(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vertices);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _mesh.vertices, WebGL2RenderingContext.STATIC_DRAW);
            let indices = RenderOperator.assert(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, indices);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _mesh.indices, WebGL2RenderingContext.STATIC_DRAW);
            let textureUVs = RenderOperator.crc3.createBuffer();
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, textureUVs);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _mesh.textureUVs, WebGL2RenderingContext.STATIC_DRAW);
            let normalsFace = RenderOperator.assert(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, normalsFace);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _mesh.normalsFace, WebGL2RenderingContext.STATIC_DRAW);
            let bufferInfo = {
                vertices: vertices,
                indices: indices,
                nIndices: _mesh.getIndexCount(),
                textureUVs: textureUVs,
                normalsFace: normalsFace
            };
            return bufferInfo;
        }
        static useBuffers(_renderBuffers) {
            // TODO: currently unused, done specifically in draw. Could be saved in VAO within RenderBuffers
            // RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            // RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);
            // RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.textureUVs);
        }
        static deleteBuffers(_renderBuffers) {
            if (_renderBuffers) {
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
                RenderOperator.crc3.deleteBuffer(_renderBuffers.vertices);
                RenderOperator.crc3.deleteBuffer(_renderBuffers.textureUVs);
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, null);
                RenderOperator.crc3.deleteBuffer(_renderBuffers.indices);
            }
        }
        // #endregion
        // #region MaterialParameters
        static createParameter(_coat) {
            // let vao: WebGLVertexArrayObject = RenderOperator.assert<WebGLVertexArrayObject>(RenderOperator.crc3.createVertexArray());
            let coatInfo = {
                //vao: null,
                coat: _coat
            };
            return coatInfo;
        }
        static useParameter(_coatInfo) {
            // RenderOperator.crc3.bindVertexArray(_coatInfo.vao);
        }
        static deleteParameter(_coatInfo) {
            if (_coatInfo) {
                RenderOperator.crc3.bindVertexArray(null);
                // RenderOperator.crc3.deleteVertexArray(_coatInfo.vao);
            }
        }
        // #endregion
        /**
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
         */
        static setAttributeStructure(_attributeLocation, _bufferSpecification) {
            RenderOperator.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
        }
    }
    FudgeCore.RenderOperator = RenderOperator;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderInjector.ts"/>
/// <reference path="../Render/RenderOperator.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderInjector.ts"/>
/// <reference path="../Render/RenderOperator.ts"/>
(function (FudgeCore) {
    /**
     * Holds data to feed into a [[Shader]] to describe the surface of [[Mesh]].
     * [[Material]]s reference [[Coat]] and [[Shader]].
     * The method useRenderData will be injected by [[RenderInjector]] at runtime, extending the functionality of this class to deal with the renderer.
     */
    class Coat extends FudgeCore.Mutable {
        constructor() {
            super(...arguments);
            this.name = "Coat";
            //#endregion
        }
        mutate(_mutator) {
            super.mutate(_mutator);
        }
        useRenderData(_renderShader) { }
        //#region Transfer
        serialize() {
            let serialization = this.getMutator();
            return serialization;
        }
        deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
        reduceMutator() { }
    }
    FudgeCore.Coat = Coat;
    /**
     * The simplest [[Coat]] providing just a color
     */
    let CoatColored = class CoatColored extends Coat {
        constructor(_color) {
            super();
            this.color = _color || new FudgeCore.Color(0.5, 0.5, 0.5, 1);
        }
    };
    CoatColored = __decorate([
        FudgeCore.RenderInjector.decorateCoat
    ], CoatColored);
    FudgeCore.CoatColored = CoatColored;
    /**
     * A [[Coat]] providing a texture and additional data for texturing
     */
    let CoatTextured = class CoatTextured extends Coat {
        constructor() {
            super(...arguments);
            this.texture = null;
        }
    };
    CoatTextured = __decorate([
        FudgeCore.RenderInjector.decorateCoat
    ], CoatTextured);
    FudgeCore.CoatTextured = CoatTextured;
    /**
     * A [[Coat]] to be used by the MatCap Shader providing a texture, a tint color (0.5 grey is neutral)
     * and a flatMix number for mixing between smooth and flat shading.
     */
    let CoatMatCap = class CoatMatCap extends Coat {
        constructor(_texture, _tintcolor, _flatmix) {
            super();
            this.texture = null;
            this.tintColor = new FudgeCore.Color(0.5, 0.5, 0.5, 1);
            this.flatMix = 0.5;
            this.texture = _texture || new FudgeCore.TextureImage();
            this.tintColor = _tintcolor || new FudgeCore.Color(0.5, 0.5, 0.5, 1);
            this.flatMix = _flatmix > 1.0 ? this.flatMix = 1.0 : this.flatMix = _flatmix || 0.5;
        }
    };
    CoatMatCap = __decorate([
        FudgeCore.RenderInjector.decorateCoat
    ], CoatMatCap);
    FudgeCore.CoatMatCap = CoatMatCap;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * Superclass for all [[Component]]s that can be attached to [[Node]]s.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Component extends FudgeCore.Mutable {
        constructor() {
            super(...arguments);
            this.singleton = true;
            this.container = null;
            this.active = true;
            //#endregion
        }
        activate(_on) {
            this.active = _on;
            this.dispatchEvent(new Event(_on ? "componentActivate" /* COMPONENT_ACTIVATE */ : "componentDeactivate" /* COMPONENT_DEACTIVATE */));
        }
        get isActive() {
            return this.active;
        }
        /**
         * Is true, when only one instance of the component class can be attached to a node
         */
        get isSingleton() {
            return this.singleton;
        }
        /**
         * Retrieves the node, this component is currently attached to
         * @returns The container node or null, if the component is not attached to
         */
        getContainer() {
            return this.container;
        }
        /**
         * Tries to add the component to the given node, removing it from the previous container if applicable
         * @param _container The node to attach this component to
         */
        setContainer(_container) {
            if (this.container == _container)
                return;
            let previousContainer = this.container;
            try {
                if (previousContainer)
                    previousContainer.removeComponent(this);
                this.container = _container;
                if (this.container)
                    this.container.addComponent(this);
            }
            catch {
                this.container = previousContainer;
            }
        }
        //#region Transfer
        serialize() {
            let serialization = {
                active: this.active
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.active = _serialization.active;
            return this;
        }
        reduceMutator(_mutator) {
            delete _mutator.singleton;
            delete _mutator.container;
        }
    }
    FudgeCore.Component = Component;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="Component.ts"/>
var FudgeCore;
/// <reference path="Component.ts"/>
(function (FudgeCore) {
    /**
     * Holds different playmodes the animation uses to play back its animation.
     * @author Lukas Scheuerle, HFU, 2019
     */
    let ANIMATION_PLAYMODE;
    (function (ANIMATION_PLAYMODE) {
        /**Plays animation in a loop: it restarts once it hit the end.*/
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["LOOP"] = 0] = "LOOP";
        /**Plays animation once and stops at the last key/frame*/
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["PLAYONCE"] = 1] = "PLAYONCE";
        /**Plays animation once and stops on the first key/frame */
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["PLAYONCESTOPAFTER"] = 2] = "PLAYONCESTOPAFTER";
        /**Plays animation like LOOP, but backwards.*/
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["REVERSELOOP"] = 3] = "REVERSELOOP";
        /**Causes the animation not to play at all. Useful for jumping to various positions in the animation without proceeding in the animation.*/
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["STOP"] = 4] = "STOP";
        //TODO: add an INHERIT and a PINGPONG mode
    })(ANIMATION_PLAYMODE = FudgeCore.ANIMATION_PLAYMODE || (FudgeCore.ANIMATION_PLAYMODE = {}));
    let ANIMATION_PLAYBACK;
    (function (ANIMATION_PLAYBACK) {
        //TODO: add an in-depth description of what happens to the animation (and events) depending on the Playback. Use Graphs to explain.
        /**Calculates the state of the animation at the exact position of time. Ignores FPS value of animation.*/
        ANIMATION_PLAYBACK[ANIMATION_PLAYBACK["TIMEBASED_CONTINOUS"] = 0] = "TIMEBASED_CONTINOUS";
        /**Limits the calculation of the state of the animation to the FPS value of the animation. Skips frames if needed.*/
        ANIMATION_PLAYBACK[ANIMATION_PLAYBACK["TIMEBASED_RASTERED_TO_FPS"] = 1] = "TIMEBASED_RASTERED_TO_FPS";
        /**Uses the FPS value of the animation to advance once per frame, no matter the speed of the frames. Doesn't skip any frames.*/
        ANIMATION_PLAYBACK[ANIMATION_PLAYBACK["FRAMEBASED"] = 2] = "FRAMEBASED";
    })(ANIMATION_PLAYBACK = FudgeCore.ANIMATION_PLAYBACK || (FudgeCore.ANIMATION_PLAYBACK = {}));
    /**
     * Holds a reference to an [[Animation]] and controls it. Controls playback and playmode as well as speed.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    class ComponentAnimator extends FudgeCore.Component {
        constructor(_animation = new FudgeCore.Animation(""), _playmode = ANIMATION_PLAYMODE.LOOP, _playback = ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
            super();
            this.speedScalesWithGlobalSpeed = true;
            this.speedScale = 1;
            this.lastTime = 0;
            this.animation = _animation;
            this.playmode = _playmode;
            this.playback = _playback;
            this.localTime = new FudgeCore.Time();
            //TODO: update animation total time when loading a different animation?
            this.animation.calculateTotalTime();
            FudgeCore.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.updateAnimationLoop.bind(this));
            FudgeCore.Time.game.addEventListener("timeScaled" /* TIME_SCALED */, this.updateScale.bind(this));
        }
        set speed(_s) {
            this.speedScale = _s;
            this.updateScale();
        }
        /**
         * Jumps to a certain time in the animation to play from there.
         * @param _time The time to jump to
         */
        jumpTo(_time) {
            this.localTime.set(_time);
            this.lastTime = _time;
            _time = _time % this.animation.totalTime;
            let mutator = this.animation.getMutated(_time, this.calculateDirection(_time), this.playback);
            this.getContainer().applyAnimation(mutator);
        }
        /**
         * Returns the current time of the animation, modulated for animation length.
         */
        getCurrentTime() {
            return this.localTime.get() % this.animation.totalTime;
        }
        /**
         * Forces an update of the animation from outside. Used in the ViewAnimation. Shouldn't be used during the game.
         * @param _time the (unscaled) time to update the animation with.
         * @returns a Tupel containing the Mutator for Animation and the playmode corrected time.
         */
        updateAnimation(_time) {
            return this.updateAnimationLoop(null, _time);
        }
        //#region transfer
        serialize() {
            let s = super.serialize();
            s["animation"] = this.animation.serialize();
            s["playmode"] = this.playmode;
            s["playback"] = this.playback;
            s["speedScale"] = this.speedScale;
            s["speedScalesWithGlobalSpeed"] = this.speedScalesWithGlobalSpeed;
            s[super.constructor.name] = super.serialize();
            return s;
        }
        deserialize(_s) {
            this.animation = new FudgeCore.Animation("");
            this.animation.deserialize(_s.animation);
            this.playback = _s.playback;
            this.playmode = _s.playmode;
            this.speedScale = _s.speedScale;
            this.speedScalesWithGlobalSpeed = _s.speedScalesWithGlobalSpeed;
            super.deserialize(_s[super.constructor.name]);
            return this;
        }
        //#endregion
        //#region updateAnimation
        /**
         * Updates the Animation.
         * Gets called every time the Loop fires the LOOP_FRAME Event.
         * Uses the built-in time unless a different time is specified.
         * May also be called from updateAnimation().
         */
        updateAnimationLoop(_e, _time) {
            if (this.animation.totalTime == 0)
                return [null, 0];
            let time = _time || this.localTime.get();
            if (this.playback == ANIMATION_PLAYBACK.FRAMEBASED) {
                time = this.lastTime + (1000 / this.animation.fps);
            }
            let direction = this.calculateDirection(time);
            time = this.applyPlaymodes(time);
            this.executeEvents(this.animation.getEventsToFire(this.lastTime, time, this.playback, direction));
            if (this.lastTime != time) {
                this.lastTime = time;
                time = time % this.animation.totalTime;
                let mutator = this.animation.getMutated(time, direction, this.playback);
                if (this.getContainer()) {
                    this.getContainer().applyAnimation(mutator);
                }
                return [mutator, time];
            }
            return [null, time];
        }
        /**
         * Fires all custom events the Animation should have fired between the last frame and the current frame.
         * @param events a list of names of custom events to fire
         */
        executeEvents(events) {
            for (let i = 0; i < events.length; i++) {
                this.dispatchEvent(new Event(events[i]));
            }
        }
        /**
         * Calculates the actual time to use, using the current playmodes.
         * @param _time the time to apply the playmodes to
         * @returns the recalculated time
         */
        applyPlaymodes(_time) {
            switch (this.playmode) {
                case ANIMATION_PLAYMODE.STOP:
                    return this.localTime.getOffset();
                case ANIMATION_PLAYMODE.PLAYONCE:
                    if (_time >= this.animation.totalTime)
                        return this.animation.totalTime - 0.01; //TODO: this might cause some issues
                    else
                        return _time;
                case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
                    if (_time >= this.animation.totalTime)
                        return this.animation.totalTime + 0.01; //TODO: this might cause some issues
                    else
                        return _time;
                default:
                    return _time;
            }
        }
        /**
         * Calculates and returns the direction the animation should currently be playing in.
         * @param _time the time at which to calculate the direction
         * @returns 1 if forward, 0 if stop, -1 if backwards
         */
        calculateDirection(_time) {
            switch (this.playmode) {
                case ANIMATION_PLAYMODE.STOP:
                    return 0;
                // case ANIMATION_PLAYMODE.PINGPONG:
                //   if (Math.floor(_time / this.animation.totalTime) % 2 == 0)
                //     return 1;
                //   else
                //     return -1;
                case ANIMATION_PLAYMODE.REVERSELOOP:
                    return -1;
                case ANIMATION_PLAYMODE.PLAYONCE:
                case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
                    if (_time >= this.animation.totalTime) {
                        return 0;
                    }
                default:
                    return 1;
            }
        }
        /**
         * Updates the scale of the animation if the user changes it or if the global game timer changed its scale.
         */
        updateScale() {
            let newScale = this.speedScale;
            if (this.speedScalesWithGlobalSpeed)
                newScale *= FudgeCore.Time.game.getScale();
            this.localTime.setScale(newScale);
        }
    }
    FudgeCore.ComponentAnimator = ComponentAnimator;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="Component.ts"/>
var FudgeCore;
/// <reference path="Component.ts"/>
(function (FudgeCore) {
    /**
     * Attaches a [[ComponentAudio]] to a [[Node]].
     * Only a single [[Audio]] can be used within a single [[ComponentAudio]]
     * @authors Thomas Dorner, HFU, 2019
     */
    class ComponentAudio extends FudgeCore.Component {
        constructor(_audio) {
            super();
            this.setAudio(_audio);
        }
        setLocalisation(_localisation) {
            this.localisation = _localisation;
        }
        /**
         * playAudio
         */
        playAudio(_audioContext) {
            this.audio.initBufferSource(_audioContext);
            this.audio.bufferSource.start(_audioContext.currentTime);
        }
        /**
         * Adds an [[Audio]] to the [[ComponentAudio]]
         * @param _audio Decoded Audio Data as [[Audio]]
         */
        setAudio(_audio) {
            this.audio = _audio;
        }
    }
    FudgeCore.ComponentAudio = ComponentAudio;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="Component.ts"/>
var FudgeCore;
/// <reference path="Component.ts"/>
(function (FudgeCore) {
    /**
     * Attaches a [[AudioListener]] to the node
     * @authors Thomas Dorner, HFU, 2019
     */
    class ComponentAudioListener extends FudgeCore.Component {
    }
    FudgeCore.ComponentAudioListener = ComponentAudioListener;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="Component.ts"/>
var FudgeCore;
/// <reference path="Component.ts"/>
(function (FudgeCore) {
    let FIELD_OF_VIEW;
    (function (FIELD_OF_VIEW) {
        FIELD_OF_VIEW[FIELD_OF_VIEW["HORIZONTAL"] = 0] = "HORIZONTAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["VERTICAL"] = 1] = "VERTICAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["DIAGONAL"] = 2] = "DIAGONAL";
    })(FIELD_OF_VIEW = FudgeCore.FIELD_OF_VIEW || (FudgeCore.FIELD_OF_VIEW = {}));
    /**
     * Defines identifiers for the various projections a camera can provide.
     * TODO: change back to number enum if strings not needed
     */
    let PROJECTION;
    (function (PROJECTION) {
        PROJECTION["CENTRAL"] = "central";
        PROJECTION["ORTHOGRAPHIC"] = "orthographic";
        PROJECTION["DIMETRIC"] = "dimetric";
        PROJECTION["STEREO"] = "stereo";
    })(PROJECTION = FudgeCore.PROJECTION || (FudgeCore.PROJECTION = {}));
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentCamera extends FudgeCore.Component {
        constructor() {
            super(...arguments);
            this.pivot = FudgeCore.Matrix4x4.IDENTITY;
            //private orthographic: boolean = false; // Determines whether the image will be rendered with perspective or orthographic projection.
            this.projection = PROJECTION.CENTRAL;
            this.transform = new FudgeCore.Matrix4x4; // The matrix to multiply each scene objects transformation by, to determine where it will be drawn.
            this.fieldOfView = 45; // The camera's sensorangle.
            this.aspectRatio = 1.0;
            this.direction = FIELD_OF_VIEW.DIAGONAL;
            this.backgroundColor = new FudgeCore.Color(0, 0, 0, 1); // The color of the background the camera will render.
            this.backgroundEnabled = true; // Determines whether or not the background of this camera will be rendered.
            //#endregion
        }
        // TODO: examine, if background should be an attribute of Camera or Viewport
        getProjection() {
            return this.projection;
        }
        getBackgoundColor() {
            return this.backgroundColor;
        }
        getBackgroundEnabled() {
            return this.backgroundEnabled;
        }
        getAspect() {
            return this.aspectRatio;
        }
        getFieldOfView() {
            return this.fieldOfView;
        }
        getDirection() {
            return this.direction;
        }
        /**
         * Returns the multiplikation of the worldtransformation of the camera container with the projection matrix
         * @returns the world-projection-matrix
         */
        get ViewProjectionMatrix() {
            let world = this.pivot;
            try {
                world = FudgeCore.Matrix4x4.MULTIPLICATION(this.getContainer().mtxWorld, this.pivot);
            }
            catch (_error) {
                // no container node or no world transformation found -> continue with pivot only
            }
            let viewMatrix = FudgeCore.Matrix4x4.INVERSION(world);
            return FudgeCore.Matrix4x4.MULTIPLICATION(this.transform, viewMatrix);
        }
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         * @param _direction The plane on which the fieldOfView-Angle is given
         */
        projectCentral(_aspect = this.aspectRatio, _fieldOfView = this.fieldOfView, _direction = this.direction) {
            this.aspectRatio = _aspect;
            this.fieldOfView = _fieldOfView;
            this.direction = _direction;
            this.projection = PROJECTION.CENTRAL;
            this.transform = FudgeCore.Matrix4x4.PROJECTION_CENTRAL(_aspect, this.fieldOfView, 1, 2000, this.direction); // TODO: remove magic numbers
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvas.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        projectOrthographic(_left = 0, _right = FudgeCore.RenderManager.getCanvas().clientWidth, _bottom = FudgeCore.RenderManager.getCanvas().clientHeight, _top = 0) {
            this.projection = PROJECTION.ORTHOGRAPHIC;
            this.transform = FudgeCore.Matrix4x4.PROJECTION_ORTHOGRAPHIC(_left, _right, _bottom, _top, 400, -400); // TODO: examine magic numbers!
        }
        /**
         * Return the calculated normed dimension of the projection space
         */
        getProjectionRectangle() {
            let tanFov = Math.tan(Math.PI * this.fieldOfView / 360); // Half of the angle, to calculate dimension from the center -> right angle
            let tanHorizontal = 0;
            let tanVertical = 0;
            if (this.direction == FIELD_OF_VIEW.DIAGONAL) {
                let aspect = Math.sqrt(this.aspectRatio);
                tanHorizontal = tanFov * aspect;
                tanVertical = tanFov / aspect;
            }
            else if (this.direction == FIELD_OF_VIEW.VERTICAL) {
                tanVertical = tanFov;
                tanHorizontal = tanVertical * this.aspectRatio;
            }
            else { //FOV_DIRECTION.HORIZONTAL
                tanHorizontal = tanFov;
                tanVertical = tanHorizontal / this.aspectRatio;
            }
            return FudgeCore.Rectangle.GET(0, 0, tanHorizontal * 2, tanVertical * 2);
        }
        //#region Transfer
        serialize() {
            let serialization = {
                backgroundColor: this.backgroundColor,
                backgroundEnabled: this.backgroundEnabled,
                projection: this.projection,
                fieldOfView: this.fieldOfView,
                direction: this.direction,
                aspect: this.aspectRatio,
                pivot: this.pivot.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.backgroundColor = _serialization.backgroundColor;
            this.backgroundEnabled = _serialization.backgroundEnabled;
            this.projection = _serialization.projection;
            this.fieldOfView = _serialization.fieldOfView;
            this.aspectRatio = _serialization.aspect;
            this.direction = _serialization.direction;
            this.pivot.deserialize(_serialization.pivot);
            super.deserialize(_serialization[super.constructor.name]);
            switch (this.projection) {
                case PROJECTION.ORTHOGRAPHIC:
                    this.projectOrthographic(); // TODO: serialize and deserialize parameters
                    break;
                case PROJECTION.CENTRAL:
                    this.projectCentral();
                    break;
            }
            return this;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.direction)
                types.direction = FIELD_OF_VIEW;
            if (types.projection)
                types.projection = PROJECTION;
            return types;
        }
        mutate(_mutator) {
            super.mutate(_mutator);
            switch (this.projection) {
                case PROJECTION.CENTRAL:
                    this.projectCentral(this.aspectRatio, this.fieldOfView, this.direction);
                    break;
            }
        }
        reduceMutator(_mutator) {
            delete _mutator.transform;
            super.reduceMutator(_mutator);
        }
    }
    FudgeCore.ComponentCamera = ComponentCamera;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Baseclass for different kinds of lights.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Light extends FudgeCore.Mutable {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super();
            this.color = _color;
        }
        reduceMutator() { }
    }
    FudgeCore.Light = Light;
    /**
     * Ambient light, coming from all directions, illuminating everything with its color independent of position and orientation (like a foggy day or in the shades)
     * ```plaintext
     * ~ ~ ~
     *  ~ ~ ~
     * ```
     */
    class LightAmbient extends Light {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super(_color);
        }
    }
    FudgeCore.LightAmbient = LightAmbient;
    /**
     * Directional light, illuminating everything from a specified direction with its color (like standing in bright sunlight)
     * ```plaintext
     * --->
     * --->
     * --->
     * ```
     */
    class LightDirectional extends Light {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super(_color);
        }
    }
    FudgeCore.LightDirectional = LightDirectional;
    /**
     * Omnidirectional light emitting from its position, illuminating objects depending on their position and distance with its color (like a colored light bulb)
     * ```plaintext
     *         .\|/.
     *        -- o --
     *         ´/|\`
     * ```
     */
    class LightPoint extends Light {
        constructor() {
            super(...arguments);
            this.range = 10;
        }
    }
    FudgeCore.LightPoint = LightPoint;
    /**
     * Spot light emitting within a specified angle from its position, illuminating objects depending on their position and distance with its color
     * ```plaintext
     *          o
     *         /|\
     *        / | \
     * ```
     */
    class LightSpot extends Light {
    }
    FudgeCore.LightSpot = LightSpot;
})(FudgeCore || (FudgeCore = {}));
///<reference path="../Light/Light.ts"/>
var FudgeCore;
///<reference path="../Light/Light.ts"/>
(function (FudgeCore) {
    /**
     * Attaches a [[Light]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    /**
     * Defines identifiers for the various types of light this component can provide.
     */
    // export enum LIGHT_TYPE {
    //     AMBIENT = "ambient",
    //     DIRECTIONAL = "directional",
    //     POINT = "point",
    //     SPOT = "spot"
    // }
    class ComponentLight extends FudgeCore.Component {
        constructor(_light = new FudgeCore.LightAmbient()) {
            super();
            // private static constructors: { [type: string]: General } = { [LIGHT_TYPE.AMBIENT]: LightAmbient, [LIGHT_TYPE.DIRECTIONAL]: LightDirectional, [LIGHT_TYPE.POINT]: LightPoint, [LIGHT_TYPE.SPOT]: LightSpot };
            this.pivot = FudgeCore.Matrix4x4.IDENTITY;
            this.light = null;
            this.singleton = false;
            this.light = _light;
        }
        setType(_class) {
            let mtrOld = {};
            if (this.light)
                mtrOld = this.light.getMutator();
            this.light = new _class();
            this.light.mutate(mtrOld);
        }
    }
    FudgeCore.ComponentLight = ComponentLight;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Attaches a [[Material]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMaterial extends FudgeCore.Component {
        constructor(_material = null) {
            super();
            this.material = _material;
        }
        //#region Transfer
        serialize() {
            let serialization;
            /* at this point of time, serialization as resource and as inline object is possible. TODO: check if inline becomes obsolete */
            let idMaterial = this.material.idResource;
            if (idMaterial)
                serialization = { idMaterial: idMaterial };
            else
                serialization = { material: FudgeCore.Serializer.serialize(this.material) };
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        deserialize(_serialization) {
            let material;
            if (_serialization.idMaterial)
                material = FudgeCore.ResourceManager.get(_serialization.idMaterial);
            else
                material = FudgeCore.Serializer.deserialize(_serialization.material);
            this.material = material;
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
    }
    FudgeCore.ComponentMaterial = ComponentMaterial;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Attaches a [[Mesh]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends FudgeCore.Component {
        constructor(_mesh = null) {
            super();
            this.pivot = FudgeCore.Matrix4x4.IDENTITY;
            this.mesh = null;
            this.mesh = _mesh;
        }
        //#region Transfer
        serialize() {
            let serialization;
            /* at this point of time, serialization as resource and as inline object is possible. TODO: check if inline becomes obsolete */
            let idMesh = this.mesh.idResource;
            if (idMesh)
                serialization = { idMesh: idMesh };
            else
                serialization = { mesh: FudgeCore.Serializer.serialize(this.mesh) };
            serialization.pivot = this.pivot.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        deserialize(_serialization) {
            let mesh;
            if (_serialization.idMesh)
                mesh = FudgeCore.ResourceManager.get(_serialization.idMesh);
            else
                mesh = FudgeCore.Serializer.deserialize(_serialization.mesh);
            this.mesh = mesh;
            this.pivot.deserialize(_serialization.pivot);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
    }
    FudgeCore.ComponentMesh = ComponentMesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentScript extends FudgeCore.Component {
        constructor() {
            super();
            this.singleton = false;
        }
        serialize() {
            return this.getMutator();
        }
        deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
    }
    FudgeCore.ComponentScript = ComponentScript;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Attaches a transform-[[Matrix4x4]] to the node, moving, scaling and rotating it in space relative to its parent.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends FudgeCore.Component {
        constructor(_matrix = FudgeCore.Matrix4x4.IDENTITY) {
            super();
            this.local = _matrix;
        }
        //#region Transfer
        serialize() {
            let serialization = {
                local: this.local.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            super.deserialize(_serialization[super.constructor.name]);
            this.local.deserialize(_serialization.local);
            return this;
        }
        // public mutate(_mutator: Mutator): void {
        //     this.local.mutate(_mutator);
        // }
        // public getMutator(): Mutator { 
        //     return this.local.getMutator();
        // }
        // public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
        //     let types: MutatorAttributeTypes = this.local.getMutatorAttributeTypes(_mutator);
        //     return types;
        // }
        reduceMutator(_mutator) {
            delete _mutator.world;
            super.reduceMutator(_mutator);
        }
    }
    FudgeCore.ComponentTransform = ComponentTransform;
})(FudgeCore || (FudgeCore = {}));
// <reference path="DebugAlert.ts"/>
var FudgeCore;
// <reference path="DebugAlert.ts"/>
(function (FudgeCore) {
    /**
     * The filters corresponding to debug activities, more to come
     */
    let DEBUG_FILTER;
    (function (DEBUG_FILTER) {
        DEBUG_FILTER[DEBUG_FILTER["NONE"] = 0] = "NONE";
        DEBUG_FILTER[DEBUG_FILTER["INFO"] = 1] = "INFO";
        DEBUG_FILTER[DEBUG_FILTER["LOG"] = 2] = "LOG";
        DEBUG_FILTER[DEBUG_FILTER["WARN"] = 4] = "WARN";
        DEBUG_FILTER[DEBUG_FILTER["ERROR"] = 8] = "ERROR";
        DEBUG_FILTER[DEBUG_FILTER["ALL"] = 15] = "ALL";
    })(DEBUG_FILTER = FudgeCore.DEBUG_FILTER || (FudgeCore.DEBUG_FILTER = {}));
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Base class for the different DebugTargets, mainly for technical purpose of inheritance
     */
    class DebugTarget {
        static mergeArguments(_message, ..._args) {
            let out = JSON.stringify(_message);
            for (let arg of _args)
                out += "\n" + JSON.stringify(arg, null, 2);
            return out;
        }
    }
    FudgeCore.DebugTarget = DebugTarget;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugTarget.ts"/>
var FudgeCore;
/// <reference path="DebugTarget.ts"/>
(function (FudgeCore) {
    /**
     * Routing to the alert box
     */
    class DebugAlert extends FudgeCore.DebugTarget {
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                let out = _headline + "\n\n" + FudgeCore.DebugTarget.mergeArguments(_message, ..._args);
                alert(out);
            };
            return delegate;
        }
    }
    DebugAlert.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: DebugAlert.createDelegate("Info"),
        [FudgeCore.DEBUG_FILTER.LOG]: DebugAlert.createDelegate("Log"),
        [FudgeCore.DEBUG_FILTER.WARN]: DebugAlert.createDelegate("Warn"),
        [FudgeCore.DEBUG_FILTER.ERROR]: DebugAlert.createDelegate("Error")
    };
    FudgeCore.DebugAlert = DebugAlert;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugTarget.ts"/>
var FudgeCore;
/// <reference path="DebugTarget.ts"/>
(function (FudgeCore) {
    /**
     * Routing to the standard-console
     */
    class DebugConsole extends FudgeCore.DebugTarget {
    }
    DebugConsole.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: console.info,
        [FudgeCore.DEBUG_FILTER.LOG]: console.log,
        [FudgeCore.DEBUG_FILTER.WARN]: console.warn,
        [FudgeCore.DEBUG_FILTER.ERROR]: console.error
    };
    FudgeCore.DebugConsole = DebugConsole;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
var FudgeCore;
/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
(function (FudgeCore) {
    /**
     * The Debug-Class offers functions known from the console-object and additions,
     * routing the information to various [[DebugTargets]] that can be easily defined by the developers and registerd by users
     */
    class Debug {
        /**
         * De- / Activate a filter for the given DebugTarget.
         * @param _target
         * @param _filter
         */
        static setFilter(_target, _filter) {
            for (let filter in Debug.delegates)
                Debug.delegates[filter].delete(_target);
            for (let filter in FudgeCore.DEBUG_FILTER) {
                let parsed = parseInt(filter);
                if (parsed == FudgeCore.DEBUG_FILTER.ALL)
                    break;
                if (_filter & parsed)
                    Debug.delegates[parsed].set(_target, _target.delegates[parsed]);
            }
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * info(...) displays additional information with low priority
         * @param _message
         * @param _args
         */
        static info(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.INFO, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * log(...) displays information with medium priority
         * @param _message
         * @param _args
         */
        static log(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.LOG, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * warn(...) displays information about non-conformities in usage, which is emphasized e.g. by color
         * @param _message
         * @param _args
         */
        static warn(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.WARN, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * error(...) displays critical information about failures, which is emphasized e.g. by color
         * @param _message
         * @param _args
         */
        static error(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.ERROR, _message, _args);
        }
        /**
         * Lookup all delegates registered to the filter and call them using the given arguments
         * @param _filter
         * @param _message
         * @param _args
         */
        static delegate(_filter, _message, _args) {
            let delegates = Debug.delegates[_filter];
            for (let delegate of delegates.values())
                if (_args.length > 0)
                    delegate(_message, ..._args);
                else
                    delegate(_message);
        }
    }
    /**
     * For each set filter, this associative array keeps references to the registered delegate functions of the chosen [[DebugTargets]]
     */
    // TODO: implement anonymous function setting up all filters
    Debug.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[FudgeCore.DEBUG_FILTER.INFO]]]),
        [FudgeCore.DEBUG_FILTER.LOG]: new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[FudgeCore.DEBUG_FILTER.LOG]]]),
        [FudgeCore.DEBUG_FILTER.WARN]: new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[FudgeCore.DEBUG_FILTER.WARN]]]),
        [FudgeCore.DEBUG_FILTER.ERROR]: new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[FudgeCore.DEBUG_FILTER.ERROR]]])
    };
    FudgeCore.Debug = Debug;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugTarget.ts"/>
var FudgeCore;
/// <reference path="DebugTarget.ts"/>
(function (FudgeCore) {
    /**
     * Routing to a HTMLDialogElement
     */
    class DebugDialog extends FudgeCore.DebugTarget {
    }
    FudgeCore.DebugDialog = DebugDialog;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugTarget.ts"/>
var FudgeCore;
/// <reference path="DebugTarget.ts"/>
(function (FudgeCore) {
    /**
     * Route to an HTMLTextArea, may be obsolete when using HTMLDialogElement
     */
    class DebugTextArea extends FudgeCore.DebugTarget {
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                let out = _headline + "\n\n" + FudgeCore.DebugTarget.mergeArguments(_message, _args);
                DebugTextArea.textArea.textContent += out;
            };
            return delegate;
        }
    }
    DebugTextArea.textArea = document.createElement("textarea");
    DebugTextArea.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: FudgeCore.DebugAlert.createDelegate("Info")
    };
    FudgeCore.DebugTextArea = DebugTextArea;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Defines a color as values in the range of 0 to 1 for the four channels red, green, blue and alpha (for opacity)
     */
    class Color extends FudgeCore.Mutable {
        constructor(_r = 1, _g = 1, _b = 1, _a = 1) {
            super();
            this.setNormRGBA(_r, _g, _b, _a);
        }
        static get BLACK() {
            return new Color(0, 0, 0, 1);
        }
        static get WHITE() {
            return new Color(1, 1, 1, 1);
        }
        static get RED() {
            return new Color(1, 0, 0, 1);
        }
        static get GREEN() {
            return new Color(0, 1, 0, 1);
        }
        static get BLUE() {
            return new Color(0, 0, 1, 1);
        }
        static get YELLOW() {
            return new Color(1, 1, 0, 1);
        }
        static get CYAN() {
            return new Color(0, 1, 1, 1);
        }
        static get MAGENTA() {
            return new Color(1, 0, 1, 1);
        }
        setNormRGBA(_r, _g, _b, _a) {
            this.r = Math.min(1, Math.max(0, _r));
            this.g = Math.min(1, Math.max(0, _g));
            this.b = Math.min(1, Math.max(0, _b));
            this.a = Math.min(1, Math.max(0, _a));
        }
        setBytesRGBA(_r, _g, _b, _a) {
            this.setNormRGBA(_r / 255, _g / 255, _b / 255, _a / 255);
        }
        getArray() {
            return new Float32Array([this.r, this.g, this.b, this.a]);
        }
        setArrayNormRGBA(_color) {
            this.setNormRGBA(_color[0], _color[1], _color[2], _color[3]);
        }
        setArrayBytesRGBA(_color) {
            this.setBytesRGBA(_color[0], _color[1], _color[2], _color[3]);
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Color = Color;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Baseclass for materials. Combines a [[Shader]] with a compatible [[Coat]]
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material {
        constructor(_name, _shader, _coat) {
            this.idResource = undefined;
            this.name = _name;
            this.shaderType = _shader;
            if (_shader) {
                if (_coat)
                    this.setCoat(_coat);
                else
                    this.setCoat(this.createCoatMatchingShader());
            }
        }
        /**
         * Creates a new [[Coat]] instance that is valid for the [[Shader]] referenced by this material
         */
        createCoatMatchingShader() {
            let coat = new (this.shaderType.getCoat())();
            return coat;
        }
        /**
         * Makes this material reference the given [[Coat]] if it is compatible with the referenced [[Shader]]
         * @param _coat
         */
        setCoat(_coat) {
            if (_coat.constructor != this.shaderType.getCoat())
                throw (new Error("Shader and coat don't match"));
            this.coat = _coat;
        }
        /**
         * Returns the currently referenced [[Coat]] instance
         */
        getCoat() {
            return this.coat;
        }
        /**
         * Changes the materials reference to the given [[Shader]], creates and references a new [[Coat]] instance
         * and mutates the new coat to preserve matching properties.
         * @param _shaderType
         */
        setShader(_shaderType) {
            this.shaderType = _shaderType;
            let coat = this.createCoatMatchingShader();
            coat.mutate(this.coat.getMutator());
            this.setCoat(coat);
        }
        /**
         * Returns the [[Shader]] referenced by this material
         */
        getShader() {
            return this.shaderType;
        }
        //#region Transfer
        // TODO: this type of serialization was implemented for implicit Material create. Check if obsolete when only one material class exists and/or materials are stored separately
        serialize() {
            let serialization = {
                name: this.name,
                idResource: this.idResource,
                shader: this.shaderType.name,
                coat: FudgeCore.Serializer.serialize(this.coat)
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.name = _serialization.name;
            this.idResource = _serialization.idResource;
            // TODO: provide for shaders in the users namespace. See Serializer fullpath etc.
            // tslint:disable-next-line: no-any
            this.shaderType = FudgeCore[_serialization.shader];
            let coat = FudgeCore.Serializer.deserialize(_serialization.coat);
            this.setCoat(coat);
            return this;
        }
    }
    FudgeCore.Material = Material;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Keeps a depot of objects that have been marked for reuse, sorted by type.
     * Using [[Recycler]] reduces load on the carbage collector and thus supports smooth performance
     */
    class Recycler {
        /**
         * Returns an object of the requested type from the depot, or a new one, if the depot was empty
         * @param _T The class identifier of the desired object
         */
        static get(_T) {
            let key = _T.name;
            let instances = Recycler.depot[key];
            if (instances && instances.length > 0)
                return instances.pop();
            else
                return new _T();
        }
        /**
         * Stores the object in the depot for later recycling. Users are responsible for throwing in objects that are about to loose scope and are not referenced by any other
         * @param _instance
         */
        static store(_instance) {
            let key = _instance.constructor.name;
            //Debug.log(key);
            let instances = Recycler.depot[key] || [];
            instances.push(_instance);
            Recycler.depot[key] = instances;
            // Debug.log(`ObjectManager.depot[${key}]: ${ObjectManager.depot[key].length}`);
            //Debug.log(this.depot);
        }
        /**
         * Emptys the depot of a given type, leaving the objects for the garbage collector. May result in a short stall when many objects were in
         * @param _T
         */
        static dump(_T) {
            let key = _T.name;
            Recycler.depot[key] = [];
        }
        /**
         * Emptys all depots, leaving all objects to the garbage collector. May result in a short stall when many objects were in
         */
        static dumpAll() {
            Recycler.depot = {};
        }
    }
    Recycler.depot = {};
    FudgeCore.Recycler = Recycler;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Static class handling the resources used with the current FUDGE-instance.
     * Keeps a list of the resources and generates ids to retrieve them.
     * Resources are objects referenced multiple times but supposed to be stored only once
     */
    class ResourceManager {
        /**
         * Generates an id for the resources and registers it with the list of resources
         * @param _resource
         */
        static register(_resource) {
            if (!_resource.idResource)
                _resource.idResource = ResourceManager.generateId(_resource);
            ResourceManager.resources[_resource.idResource] = _resource;
        }
        /**
         * Generate a user readable and unique id using the type of the resource, the date and random numbers
         * @param _resource
         */
        static generateId(_resource) {
            // TODO: build id and integrate info from resource, not just date
            let idResource;
            do
                idResource = _resource.constructor.name + "|" + new Date().toISOString() + "|" + Math.random().toPrecision(5).substr(2, 5);
            while (ResourceManager.resources[idResource]);
            return idResource;
        }
        /**
         * Tests, if an object is a [[SerializableResource]]
         * @param _object The object to examine
         */
        static isResource(_object) {
            return (Reflect.has(_object, "idResource"));
        }
        /**
         * Retrieves the resource stored with the given id
         * @param _idResource
         */
        static get(_idResource) {
            let resource = ResourceManager.resources[_idResource];
            if (!resource) {
                let serialization = ResourceManager.serialization[_idResource];
                if (!serialization) {
                    FudgeCore.Debug.error("Resource not found", _idResource);
                    return null;
                }
                resource = ResourceManager.deserializeResource(serialization);
            }
            return resource;
        }
        /**
         * Creates and registers a resource from a [[Node]], copying the complete branch starting with it
         * @param _node A node to create the resource from
         * @param _replaceWithInstance if true (default), the node used as origin is replaced by a [[NodeResourceInstance]] of the [[NodeResource]] created
         */
        static registerNodeAsResource(_node, _replaceWithInstance = true) {
            let serialization = _node.serialize();
            let nodeResource = new FudgeCore.NodeResource("NodeResource");
            nodeResource.deserialize(serialization);
            ResourceManager.register(nodeResource);
            if (_replaceWithInstance && _node.getParent()) {
                let instance = new FudgeCore.NodeResourceInstance(nodeResource);
                _node.getParent().replaceChild(_node, instance);
            }
            return nodeResource;
        }
        /**
         * Serialize all resources
         */
        static serialize() {
            let serialization = {};
            for (let idResource in ResourceManager.resources) {
                let resource = ResourceManager.resources[idResource];
                if (idResource != resource.idResource)
                    FudgeCore.Debug.error("Resource-id mismatch", resource);
                serialization[idResource] = FudgeCore.Serializer.serialize(resource);
            }
            return serialization;
        }
        /**
         * Create resources from a serialization, deleting all resources previously registered
         * @param _serialization
         */
        static deserialize(_serialization) {
            ResourceManager.serialization = _serialization;
            ResourceManager.resources = {};
            for (let idResource in _serialization) {
                let serialization = _serialization[idResource];
                let resource = ResourceManager.deserializeResource(serialization);
                if (resource)
                    ResourceManager.resources[idResource] = resource;
            }
            return ResourceManager.resources;
        }
        static deserializeResource(_serialization) {
            return FudgeCore.Serializer.deserialize(_serialization);
        }
    }
    ResourceManager.resources = {};
    ResourceManager.serialization = null;
    FudgeCore.ResourceManager = ResourceManager;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Light/Light.ts"/>
/// <reference path="../Component/ComponentLight.ts"/>
var FudgeCore;
/// <reference path="../Light/Light.ts"/>
/// <reference path="../Component/ComponentLight.ts"/>
(function (FudgeCore) {
    /**
     * Controls the rendering of a branch of a scenetree, using the given [[ComponentCamera]],
     * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
     * through a series of [[Framing]] objects. The stages involved are in order of rendering
     * [[RenderManager]].viewport -> [[Viewport]].source -> [[Viewport]].destination -> DOM-Canvas -> Client(CSS)
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Viewport extends EventTarget {
        constructor() {
            super(...arguments);
            this.name = "Viewport"; // The name to call this viewport by.
            this.camera = null; // The camera representing the view parameters to render the branch.
            // TODO: verify if client to canvas should be in Viewport or somewhere else (Window, Container?)
            // Multiple viewports using the same canvas shouldn't differ here...
            // different framing methods can be used, this is the default
            this.frameClientToCanvas = new FudgeCore.FramingScaled();
            this.frameCanvasToDestination = new FudgeCore.FramingComplex();
            this.frameDestinationToSource = new FudgeCore.FramingScaled();
            this.frameSourceToRender = new FudgeCore.FramingScaled();
            this.adjustingFrames = true;
            this.adjustingCamera = true;
            this.lights = null;
            this.branch = null; // The first node in the tree(branch) that will be rendered.
            this.crc2 = null;
            this.canvas = null;
            this.pickBuffers = [];
            /**
             * Handle drag-drop events and dispatch to viewport as FUDGE-Event
             */
            this.hndDragDropEvent = (_event) => {
                let _dragevent = _event;
                switch (_dragevent.type) {
                    case "dragover":
                    case "drop":
                        _dragevent.preventDefault();
                        _dragevent.dataTransfer.effectAllowed = "none";
                        break;
                    case "dragstart":
                        // just dummy data,  valid data should be set in handler registered by the user
                        _dragevent.dataTransfer.setData("text", "Hallo");
                        // TODO: check if there is a better solution to hide the ghost image of the draggable object
                        _dragevent.dataTransfer.setDragImage(new Image(), 0, 0);
                        break;
                }
                let event = new FudgeCore.DragDropEventƒ("ƒ" + _event.type, _dragevent);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            /**
             * Handle pointer events and dispatch to viewport as FUDGE-Event
             */
            this.hndPointerEvent = (_event) => {
                let event = new FudgeCore.PointerEventƒ("ƒ" + _event.type, _event);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            /**
             * Handle keyboard events and dispatch to viewport as FUDGE-Event, if the viewport has the focus
             */
            this.hndKeyboardEvent = (_event) => {
                if (!this.hasFocus)
                    return;
                let event = new FudgeCore.KeyboardEventƒ("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
            /**
             * Handle wheel event and dispatch to viewport as FUDGE-Event
             */
            this.hndWheelEvent = (_event) => {
                let event = new FudgeCore.WheelEventƒ("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
        }
        /**
         * Connects the viewport to the given canvas to render the given branch to using the given camera-component, and names the viewport as given.
         * @param _name
         * @param _branch
         * @param _camera
         * @param _canvas
         */
        initialize(_name, _branch, _camera, _canvas) {
            this.name = _name;
            this.camera = _camera;
            this.canvas = _canvas;
            this.crc2 = _canvas.getContext("2d");
            this.rectSource = FudgeCore.RenderManager.getCanvasRect();
            this.rectDestination = this.getClientRectangle();
            this.setBranch(_branch);
        }
        /**
         * Retrieve the 2D-context attached to the destination canvas
         */
        getContext() {
            return this.crc2;
        }
        /**
         * Retrieve the size of the destination canvas as a rectangle, x and y are always 0
         */
        getCanvasRectangle() {
            return FudgeCore.Rectangle.GET(0, 0, this.canvas.width, this.canvas.height);
        }
        /**
         * Retrieve the client rectangle the canvas is displayed and fit in, x and y are always 0
         */
        getClientRectangle() {
            return FudgeCore.Rectangle.GET(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        }
        /**
         * Set the branch to be drawn in the viewport.
         */
        setBranch(_branch) {
            if (this.branch) {
                this.branch.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndComponentEvent);
                this.branch.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndComponentEvent);
            }
            this.branch = _branch;
            this.collectLights();
            this.branch.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndComponentEvent);
            this.branch.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndComponentEvent);
        }
        /**
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph() {
            // TODO: move to debug-class
            let output = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.branch.name;
            FudgeCore.Debug.log(output + "   => ROOTNODE" + this.createSceneGraph(this.branch));
        }
        // #region Drawing
        /**
         * Draw this viewport
         */
        draw() {
            FudgeCore.RenderManager.resetFrameBuffer();
            if (!this.camera.isActive)
                return;
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();
            FudgeCore.RenderManager.clear(this.camera.getBackgoundColor());
            if (FudgeCore.RenderManager.addBranch(this.branch))
                // branch has not yet been processed fully by rendermanager -> update all registered nodes
                FudgeCore.RenderManager.update();
            FudgeCore.RenderManager.setLights(this.lights);
            FudgeCore.RenderManager.drawBranch(this.branch, this.camera);
            this.crc2.imageSmoothingEnabled = false;
            this.crc2.drawImage(FudgeCore.RenderManager.getCanvas(), this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height, this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height);
        }
        /**
        * Draw this viewport for RayCast
        */
        createPickBuffers() {
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();
            if (FudgeCore.RenderManager.addBranch(this.branch))
                // branch has not yet been processed fully by rendermanager -> update all registered nodes
                FudgeCore.RenderManager.update();
            this.pickBuffers = FudgeCore.RenderManager.drawBranchForRayCast(this.branch, this.camera);
            this.crc2.imageSmoothingEnabled = false;
            this.crc2.drawImage(FudgeCore.RenderManager.getCanvas(), this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height, this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height);
        }
        pickNodeAt(_pos) {
            // this.createPickBuffers();
            let hits = FudgeCore.RenderManager.pickNodeAt(_pos, this.pickBuffers, this.rectSource);
            hits.sort((a, b) => (b.zBuffer > 0) ? (a.zBuffer > 0) ? a.zBuffer - b.zBuffer : 1 : -1);
            return hits;
        }
        /**
         * Adjust all frames involved in the rendering process from the display area in the client up to the renderer canvas
         */
        adjustFrames() {
            // get the rectangle of the canvas area as displayed (consider css)
            let rectClient = this.getClientRectangle();
            // adjust the canvas size according to the given framing applied to client
            let rectCanvas = this.frameClientToCanvas.getRect(rectClient);
            this.canvas.width = rectCanvas.width;
            this.canvas.height = rectCanvas.height;
            // adjust the destination area on the target-canvas to render to by applying the framing to canvas
            this.rectDestination = this.frameCanvasToDestination.getRect(rectCanvas);
            // adjust the area on the source-canvas to render from by applying the framing to destination area
            this.rectSource = this.frameDestinationToSource.getRect(this.rectDestination);
            // having an offset source does make sense only when multiple viewports display parts of the same rendering. For now: shift it to 0,0
            this.rectSource.x = this.rectSource.y = 0;
            // still, a partial image of the rendering may be retrieved by moving and resizing the render viewport
            let rectRender = this.frameSourceToRender.getRect(this.rectSource);
            FudgeCore.RenderManager.setViewportRectangle(rectRender);
            // no more transformation after this for now, offscreen canvas and render-viewport have the same size
            FudgeCore.RenderManager.setCanvasSize(rectRender.width, rectRender.height);
        }
        /**
         * Adjust the camera parameters to fit the rendering into the render vieport
         */
        adjustCamera() {
            let rect = FudgeCore.RenderManager.getViewportRectangle();
            this.camera.projectCentral(rect.width / rect.height, this.camera.getFieldOfView());
        }
        // #endregion
        //#region Points
        pointClientToSource(_client) {
            let result;
            let rect;
            rect = this.getClientRectangle();
            result = this.frameClientToCanvas.getPoint(_client, rect);
            rect = this.getCanvasRectangle();
            result = this.frameCanvasToDestination.getPoint(result, rect);
            result = this.frameDestinationToSource.getPoint(result, this.rectSource);
            //TODO: when Source, Render and RenderViewport deviate, continue transformation 
            return result;
        }
        pointSourceToRender(_source) {
            let projectionRectangle = this.camera.getProjectionRectangle();
            let point = this.frameSourceToRender.getPoint(_source, projectionRectangle);
            return point;
        }
        pointClientToRender(_client) {
            let point = this.pointClientToSource(_client);
            point = this.pointSourceToRender(point);
            //TODO: when Render and RenderViewport deviate, continue transformation 
            return point;
        }
        //#endregion
        // #region Events (passing from canvas to viewport and from there into branch)
        /**
         * Returns true if this viewport currently has focus and thus receives keyboard events
         */
        get hasFocus() {
            return (Viewport.focus == this);
        }
        /**
         * Switch the viewports focus on or off. Only one viewport in one FUDGE instance can have the focus, thus receiving keyboard events.
         * So a viewport currently having the focus will lose it, when another one receives it. The viewports fire [[Event]]s accordingly.
         *
         * @param _on
         */
        setFocus(_on) {
            if (_on) {
                if (Viewport.focus == this)
                    return;
                if (Viewport.focus)
                    Viewport.focus.dispatchEvent(new Event("focusout" /* FOCUS_OUT */));
                Viewport.focus = this;
                this.dispatchEvent(new Event("focusin" /* FOCUS_IN */));
            }
            else {
                if (Viewport.focus != this)
                    return;
                this.dispatchEvent(new Event("focusout" /* FOCUS_OUT */));
                Viewport.focus = null;
            }
        }
        /**
         * De- / Activates the given pointer event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activatePointerEvent(_type, _on) {
            this.activateEvent(this.canvas, _type, this.hndPointerEvent, _on);
        }
        /**
         * De- / Activates the given keyboard event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activateKeyboardEvent(_type, _on) {
            this.activateEvent(this.canvas.ownerDocument, _type, this.hndKeyboardEvent, _on);
        }
        /**
         * De- / Activates the given drag-drop event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activateDragDropEvent(_type, _on) {
            if (_type == "\u0192dragstart" /* START */)
                this.canvas.draggable = _on;
            this.activateEvent(this.canvas, _type, this.hndDragDropEvent, _on);
        }
        /**
         * De- / Activates the wheel event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activateWheelEvent(_type, _on) {
            this.activateEvent(this.canvas, _type, this.hndWheelEvent, _on);
        }
        /**
         * Add position of the pointer mapped to canvas-coordinates as canvasX, canvasY to the event
         * @param event
         */
        addCanvasPosition(event) {
            event.canvasX = this.canvas.width * event.pointerX / event.clientRect.width;
            event.canvasY = this.canvas.height * event.pointerY / event.clientRect.height;
        }
        activateEvent(_target, _type, _handler, _on) {
            _type = _type.slice(1); // chip the ƒlorentin
            if (_on)
                _target.addEventListener(_type, _handler);
            else
                _target.removeEventListener(_type, _handler);
        }
        hndComponentEvent(_event) {
            FudgeCore.Debug.log(_event);
        }
        // #endregion
        /**
         * Collect all lights in the branch to pass to shaders
         */
        collectLights() {
            // TODO: make private
            this.lights = new Map();
            for (let node of this.branch.branch) {
                let cmpLights = node.getComponents(FudgeCore.ComponentLight);
                for (let cmpLight of cmpLights) {
                    let type = cmpLight.light.type;
                    let lightsOfType = this.lights.get(type);
                    if (!lightsOfType) {
                        lightsOfType = [];
                        this.lights.set(type, lightsOfType);
                    }
                    lightsOfType.push(cmpLight);
                }
            }
        }
        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        createSceneGraph(_fudgeNode) {
            // TODO: move to debug-class
            let output = "";
            for (let name in _fudgeNode.getChildren()) {
                let child = _fudgeNode.getChildren()[name];
                output += "\n";
                let current = child;
                if (current.getParent() && current.getParent().getParent())
                    output += "|";
                while (current.getParent() && current.getParent().getParent()) {
                    output += "   ";
                    current = current.getParent();
                }
                output += "'--";
                output += child.name;
                output += this.createSceneGraph(child);
            }
            return output;
        }
    }
    FudgeCore.Viewport = Viewport;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class PointerEventƒ extends PointerEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    FudgeCore.PointerEventƒ = PointerEventƒ;
    class DragDropEventƒ extends DragEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    FudgeCore.DragDropEventƒ = DragDropEventƒ;
    class WheelEventƒ extends WheelEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    FudgeCore.WheelEventƒ = WheelEventƒ;
    /**
     * Base class for EventTarget singletons, which are fixed entities in the structure of Fudge, such as the core loop
     */
    class EventTargetStatic extends EventTarget {
        constructor() {
            super();
        }
        static addEventListener(_type, _handler) {
            EventTargetStatic.targetStatic.addEventListener(_type, _handler);
        }
        static removeEventListener(_type, _handler) {
            EventTargetStatic.targetStatic.removeEventListener(_type, _handler);
        }
        static dispatchEvent(_event) {
            EventTargetStatic.targetStatic.dispatchEvent(_event);
            return true;
        }
    }
    EventTargetStatic.targetStatic = new EventTargetStatic();
    FudgeCore.EventTargetStatic = EventTargetStatic;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class KeyboardEventƒ extends KeyboardEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    FudgeCore.KeyboardEventƒ = KeyboardEventƒ;
    /**
     * The codes sent from a standard english keyboard layout
     */
    let KEYBOARD_CODE;
    (function (KEYBOARD_CODE) {
        KEYBOARD_CODE["A"] = "KeyA";
        KEYBOARD_CODE["B"] = "KeyB";
        KEYBOARD_CODE["C"] = "KeyC";
        KEYBOARD_CODE["D"] = "KeyD";
        KEYBOARD_CODE["E"] = "KeyE";
        KEYBOARD_CODE["F"] = "KeyF";
        KEYBOARD_CODE["G"] = "KeyG";
        KEYBOARD_CODE["H"] = "KeyH";
        KEYBOARD_CODE["I"] = "KeyI";
        KEYBOARD_CODE["J"] = "KeyJ";
        KEYBOARD_CODE["K"] = "KeyK";
        KEYBOARD_CODE["L"] = "KeyL";
        KEYBOARD_CODE["M"] = "KeyM";
        KEYBOARD_CODE["N"] = "KeyN";
        KEYBOARD_CODE["O"] = "KeyO";
        KEYBOARD_CODE["P"] = "KeyP";
        KEYBOARD_CODE["Q"] = "KeyQ";
        KEYBOARD_CODE["R"] = "KeyR";
        KEYBOARD_CODE["S"] = "KeyS";
        KEYBOARD_CODE["T"] = "KeyT";
        KEYBOARD_CODE["U"] = "KeyU";
        KEYBOARD_CODE["V"] = "KeyV";
        KEYBOARD_CODE["W"] = "KeyW";
        KEYBOARD_CODE["X"] = "KeyX";
        KEYBOARD_CODE["Y"] = "KeyY";
        KEYBOARD_CODE["Z"] = "KeyZ";
        KEYBOARD_CODE["ESC"] = "Escape";
        KEYBOARD_CODE["ZERO"] = "Digit0";
        KEYBOARD_CODE["ONE"] = "Digit1";
        KEYBOARD_CODE["TWO"] = "Digit2";
        KEYBOARD_CODE["THREE"] = "Digit3";
        KEYBOARD_CODE["FOUR"] = "Digit4";
        KEYBOARD_CODE["FIVE"] = "Digit5";
        KEYBOARD_CODE["SIX"] = "Digit6";
        KEYBOARD_CODE["SEVEN"] = "Digit7";
        KEYBOARD_CODE["EIGHT"] = "Digit8";
        KEYBOARD_CODE["NINE"] = "Digit9";
        KEYBOARD_CODE["MINUS"] = "Minus";
        KEYBOARD_CODE["EQUAL"] = "Equal";
        KEYBOARD_CODE["BACKSPACE"] = "Backspace";
        KEYBOARD_CODE["TABULATOR"] = "Tab";
        KEYBOARD_CODE["BRACKET_LEFT"] = "BracketLeft";
        KEYBOARD_CODE["BRACKET_RIGHT"] = "BracketRight";
        KEYBOARD_CODE["ENTER"] = "Enter";
        KEYBOARD_CODE["CTRL_LEFT"] = "ControlLeft";
        KEYBOARD_CODE["SEMICOLON"] = "Semicolon";
        KEYBOARD_CODE["QUOTE"] = "Quote";
        KEYBOARD_CODE["BACK_QUOTE"] = "Backquote";
        KEYBOARD_CODE["SHIFT_LEFT"] = "ShiftLeft";
        KEYBOARD_CODE["BACKSLASH"] = "Backslash";
        KEYBOARD_CODE["COMMA"] = "Comma";
        KEYBOARD_CODE["PERIOD"] = "Period";
        KEYBOARD_CODE["SLASH"] = "Slash";
        KEYBOARD_CODE["SHIFT_RIGHT"] = "ShiftRight";
        KEYBOARD_CODE["NUMPAD_MULTIPLY"] = "NumpadMultiply";
        KEYBOARD_CODE["ALT_LEFT"] = "AltLeft";
        KEYBOARD_CODE["SPACE"] = "Space";
        KEYBOARD_CODE["CAPS_LOCK"] = "CapsLock";
        KEYBOARD_CODE["F1"] = "F1";
        KEYBOARD_CODE["F2"] = "F2";
        KEYBOARD_CODE["F3"] = "F3";
        KEYBOARD_CODE["F4"] = "F4";
        KEYBOARD_CODE["F5"] = "F5";
        KEYBOARD_CODE["F6"] = "F6";
        KEYBOARD_CODE["F7"] = "F7";
        KEYBOARD_CODE["F8"] = "F8";
        KEYBOARD_CODE["F9"] = "F9";
        KEYBOARD_CODE["F10"] = "F10";
        KEYBOARD_CODE["PAUSE"] = "Pause";
        KEYBOARD_CODE["SCROLL_LOCK"] = "ScrollLock";
        KEYBOARD_CODE["NUMPAD7"] = "Numpad7";
        KEYBOARD_CODE["NUMPAD8"] = "Numpad8";
        KEYBOARD_CODE["NUMPAD9"] = "Numpad9";
        KEYBOARD_CODE["NUMPAD_SUBTRACT"] = "NumpadSubtract";
        KEYBOARD_CODE["NUMPAD4"] = "Numpad4";
        KEYBOARD_CODE["NUMPAD5"] = "Numpad5";
        KEYBOARD_CODE["NUMPAD6"] = "Numpad6";
        KEYBOARD_CODE["NUMPAD_ADD"] = "NumpadAdd";
        KEYBOARD_CODE["NUMPAD1"] = "Numpad1";
        KEYBOARD_CODE["NUMPAD2"] = "Numpad2";
        KEYBOARD_CODE["NUMPAD3"] = "Numpad3";
        KEYBOARD_CODE["NUMPAD0"] = "Numpad0";
        KEYBOARD_CODE["NUMPAD_DECIMAL"] = "NumpadDecimal";
        KEYBOARD_CODE["PRINT_SCREEN"] = "PrintScreen";
        KEYBOARD_CODE["INTL_BACK_SLASH"] = "IntlBackSlash";
        KEYBOARD_CODE["F11"] = "F11";
        KEYBOARD_CODE["F12"] = "F12";
        KEYBOARD_CODE["NUMPAD_EQUAL"] = "NumpadEqual";
        KEYBOARD_CODE["F13"] = "F13";
        KEYBOARD_CODE["F14"] = "F14";
        KEYBOARD_CODE["F15"] = "F15";
        KEYBOARD_CODE["F16"] = "F16";
        KEYBOARD_CODE["F17"] = "F17";
        KEYBOARD_CODE["F18"] = "F18";
        KEYBOARD_CODE["F19"] = "F19";
        KEYBOARD_CODE["F20"] = "F20";
        KEYBOARD_CODE["F21"] = "F21";
        KEYBOARD_CODE["F22"] = "F22";
        KEYBOARD_CODE["F23"] = "F23";
        KEYBOARD_CODE["F24"] = "F24";
        KEYBOARD_CODE["KANA_MODE"] = "KanaMode";
        KEYBOARD_CODE["LANG2"] = "Lang2";
        KEYBOARD_CODE["LANG1"] = "Lang1";
        KEYBOARD_CODE["INTL_RO"] = "IntlRo";
        KEYBOARD_CODE["CONVERT"] = "Convert";
        KEYBOARD_CODE["NON_CONVERT"] = "NonConvert";
        KEYBOARD_CODE["INTL_YEN"] = "IntlYen";
        KEYBOARD_CODE["NUMPAD_COMMA"] = "NumpadComma";
        KEYBOARD_CODE["UNDO"] = "Undo";
        KEYBOARD_CODE["PASTE"] = "Paste";
        KEYBOARD_CODE["MEDIA_TRACK_PREVIOUS"] = "MediaTrackPrevious";
        KEYBOARD_CODE["CUT"] = "Cut";
        KEYBOARD_CODE["COPY"] = "Copy";
        KEYBOARD_CODE["MEDIA_TRACK_NEXT"] = "MediaTrackNext";
        KEYBOARD_CODE["NUMPAD_ENTER"] = "NumpadEnter";
        KEYBOARD_CODE["CTRL_RIGHT"] = "ControlRight";
        KEYBOARD_CODE["AUDIO_VOLUME_MUTE"] = "AudioVolumeMute";
        KEYBOARD_CODE["LAUNCH_APP2"] = "LaunchApp2";
        KEYBOARD_CODE["MEDIA_PLAY_PAUSE"] = "MediaPlayPause";
        KEYBOARD_CODE["MEDIA_STOP"] = "MediaStop";
        KEYBOARD_CODE["EJECT"] = "Eject";
        KEYBOARD_CODE["AUDIO_VOLUME_DOWN"] = "AudioVolumeDown";
        KEYBOARD_CODE["VOLUME_DOWN"] = "VolumeDown";
        KEYBOARD_CODE["AUDIO_VOLUME_UP"] = "AudioVolumeUp";
        KEYBOARD_CODE["VOLUME_UP"] = "VolumeUp";
        KEYBOARD_CODE["BROWSER_HOME"] = "BrowserHome";
        KEYBOARD_CODE["NUMPAD_DIVIDE"] = "NumpadDivide";
        KEYBOARD_CODE["ALT_RIGHT"] = "AltRight";
        KEYBOARD_CODE["HELP"] = "Help";
        KEYBOARD_CODE["NUM_LOCK"] = "NumLock";
        KEYBOARD_CODE["HOME"] = "Home";
        KEYBOARD_CODE["ARROW_UP"] = "ArrowUp";
        KEYBOARD_CODE["ARROW_RIGHT"] = "ArrowRight";
        KEYBOARD_CODE["ARROW_DOWN"] = "ArrowDown";
        KEYBOARD_CODE["ARROW_LEFT"] = "ArrowLeft";
        KEYBOARD_CODE["END"] = "End";
        KEYBOARD_CODE["PAGE_UP"] = "PageUp";
        KEYBOARD_CODE["PAGE_DOWN"] = "PageDown";
        KEYBOARD_CODE["INSERT"] = "Insert";
        KEYBOARD_CODE["DELETE"] = "Delete";
        KEYBOARD_CODE["META_LEFT"] = "Meta_Left";
        KEYBOARD_CODE["OS_LEFT"] = "OSLeft";
        KEYBOARD_CODE["META_RIGHT"] = "MetaRight";
        KEYBOARD_CODE["OS_RIGHT"] = "OSRight";
        KEYBOARD_CODE["CONTEXT_MENU"] = "ContextMenu";
        KEYBOARD_CODE["POWER"] = "Power";
        KEYBOARD_CODE["BROWSER_SEARCH"] = "BrowserSearch";
        KEYBOARD_CODE["BROWSER_FAVORITES"] = "BrowserFavorites";
        KEYBOARD_CODE["BROWSER_REFRESH"] = "BrowserRefresh";
        KEYBOARD_CODE["BROWSER_STOP"] = "BrowserStop";
        KEYBOARD_CODE["BROWSER_FORWARD"] = "BrowserForward";
        KEYBOARD_CODE["BROWSER_BACK"] = "BrowserBack";
        KEYBOARD_CODE["LAUNCH_APP1"] = "LaunchApp1";
        KEYBOARD_CODE["LAUNCH_MAIL"] = "LaunchMail";
        KEYBOARD_CODE["LAUNCH_MEDIA_PLAYER"] = "LaunchMediaPlayer";
        //mac brings this buttton
        KEYBOARD_CODE["FN"] = "Fn";
        //Linux brings these
        KEYBOARD_CODE["AGAIN"] = "Again";
        KEYBOARD_CODE["PROPS"] = "Props";
        KEYBOARD_CODE["SELECT"] = "Select";
        KEYBOARD_CODE["OPEN"] = "Open";
        KEYBOARD_CODE["FIND"] = "Find";
        KEYBOARD_CODE["WAKE_UP"] = "WakeUp";
        KEYBOARD_CODE["NUMPAD_PARENT_LEFT"] = "NumpadParentLeft";
        KEYBOARD_CODE["NUMPAD_PARENT_RIGHT"] = "NumpadParentRight";
        //android
        KEYBOARD_CODE["SLEEP"] = "Sleep";
    })(KEYBOARD_CODE = FudgeCore.KEYBOARD_CODE || (FudgeCore.KEYBOARD_CODE = {}));
    /*
    Firefox can't make use of those buttons and Combinations:
    SINGELE_BUTTONS:
     Druck,
    COMBINATIONS:
     Shift + F10, Shift + Numpad5,
     CTRL + q, CTRL + F4,
     ALT + F1, ALT + F2, ALT + F3, ALT + F7, ALT + F8, ALT + F10
    Opera won't do good with these Buttons and combinations:
    SINGLE_BUTTONS:
     Float32Array, F11, ALT,
    COMBINATIONS:
     CTRL + q, CTRL + t, CTRL + h, CTRL + g, CTRL + n, CTRL + f
     ALT + F1, ALT + F2, ALT + F4, ALT + F5, ALT + F6, ALT + F7, ALT + F8, ALT + F10
     */
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Framing describes how to map a rectangle into a given frame
     * and how points in the frame correspond to points in the resulting rectangle
     */
    class Framing extends FudgeCore.Mutable {
        reduceMutator(_mutator) { }
    }
    FudgeCore.Framing = Framing;
    /**
     * The resulting rectangle has a fixed width and height and display should scale to fit the frame
     * Points are scaled in the same ratio
     */
    class FramingFixed extends Framing {
        constructor() {
            super(...arguments);
            this.width = 300;
            this.height = 150;
        }
        setSize(_width, _height) {
            this.width = _width;
            this.height = _height;
        }
        getPoint(_pointInFrame, _rectFrame) {
            let result = new FudgeCore.Vector2(this.width * (_pointInFrame.x - _rectFrame.x) / _rectFrame.width, this.height * (_pointInFrame.y - _rectFrame.y) / _rectFrame.height);
            return result;
        }
        getPointInverse(_point, _rect) {
            let result = new FudgeCore.Vector2(_point.x * _rect.width / this.width + _rect.x, _point.y * _rect.height / this.height + _rect.y);
            return result;
        }
        getRect(_rectFrame) {
            return FudgeCore.Rectangle.GET(0, 0, this.width, this.height);
        }
    }
    FudgeCore.FramingFixed = FramingFixed;
    /**
     * Width and height of the resulting rectangle are fractions of those of the frame, scaled by normed values normWidth and normHeight.
     * Display should scale to fit the frame and points are scaled in the same ratio
     */
    class FramingScaled extends Framing {
        constructor() {
            super(...arguments);
            this.normWidth = 1.0;
            this.normHeight = 1.0;
        }
        setScale(_normWidth, _normHeight) {
            this.normWidth = _normWidth;
            this.normHeight = _normHeight;
        }
        getPoint(_pointInFrame, _rectFrame) {
            let result = new FudgeCore.Vector2(this.normWidth * (_pointInFrame.x - _rectFrame.x), this.normHeight * (_pointInFrame.y - _rectFrame.y));
            return result;
        }
        getPointInverse(_point, _rect) {
            let result = new FudgeCore.Vector2(_point.x / this.normWidth + _rect.x, _point.y / this.normHeight + _rect.y);
            return result;
        }
        getRect(_rectFrame) {
            return FudgeCore.Rectangle.GET(0, 0, this.normWidth * _rectFrame.width, this.normHeight * _rectFrame.height);
        }
    }
    FudgeCore.FramingScaled = FramingScaled;
    /**
     * The resulting rectangle fits into a margin given as fractions of the size of the frame given by normAnchor
     * plus an absolute padding given by pixelBorder. Display should fit into this.
     */
    class FramingComplex extends Framing {
        constructor() {
            super(...arguments);
            this.margin = { left: 0, top: 0, right: 0, bottom: 0 };
            this.padding = { left: 0, top: 0, right: 0, bottom: 0 };
        }
        getPoint(_pointInFrame, _rectFrame) {
            let result = new FudgeCore.Vector2(_pointInFrame.x - this.padding.left - this.margin.left * _rectFrame.width, _pointInFrame.y - this.padding.top - this.margin.top * _rectFrame.height);
            return result;
        }
        getPointInverse(_point, _rect) {
            let result = new FudgeCore.Vector2(_point.x + this.padding.left + this.margin.left * _rect.width, _point.y + this.padding.top + this.margin.top * _rect.height);
            return result;
        }
        getRect(_rectFrame) {
            if (!_rectFrame)
                return null;
            let minX = _rectFrame.x + this.margin.left * _rectFrame.width + this.padding.left;
            let minY = _rectFrame.y + this.margin.top * _rectFrame.height + this.padding.top;
            let maxX = _rectFrame.x + (1 - this.margin.right) * _rectFrame.width - this.padding.right;
            let maxY = _rectFrame.y + (1 - this.margin.bottom) * _rectFrame.height - this.padding.bottom;
            return FudgeCore.Rectangle.GET(minX, minY, maxX - minX, maxY - minY);
        }
        getMutator() {
            return { margin: this.margin, padding: this.padding };
        }
    }
    FudgeCore.FramingComplex = FramingComplex;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Simple class for 3x3 matrix operations (This class can only handle 2D
     * transformations. Could be removed after applying full 2D compatibility to Mat4).
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix3x3 {
        constructor() {
            this.data = [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ];
        }
        static projection(_width, _height) {
            let matrix = new Matrix3x3;
            matrix.data = [
                2 / _width, 0, 0,
                0, -2 / _height, 0,
                -1, 1, 1
            ];
            return matrix;
        }
        get Data() {
            return this.data;
        }
        identity() {
            return new Matrix3x3;
        }
        translate(_matrix, _xTranslation, _yTranslation) {
            return this.multiply(_matrix, this.translation(_xTranslation, _yTranslation));
        }
        rotate(_matrix, _angleInDegrees) {
            return this.multiply(_matrix, this.rotation(_angleInDegrees));
        }
        scale(_matrix, _xScale, _yscale) {
            return this.multiply(_matrix, this.scaling(_xScale, _yscale));
        }
        multiply(_a, _b) {
            let a00 = _a.data[0 * 3 + 0];
            let a01 = _a.data[0 * 3 + 1];
            let a02 = _a.data[0 * 3 + 2];
            let a10 = _a.data[1 * 3 + 0];
            let a11 = _a.data[1 * 3 + 1];
            let a12 = _a.data[1 * 3 + 2];
            let a20 = _a.data[2 * 3 + 0];
            let a21 = _a.data[2 * 3 + 1];
            let a22 = _a.data[2 * 3 + 2];
            let b00 = _b.data[0 * 3 + 0];
            let b01 = _b.data[0 * 3 + 1];
            let b02 = _b.data[0 * 3 + 2];
            let b10 = _b.data[1 * 3 + 0];
            let b11 = _b.data[1 * 3 + 1];
            let b12 = _b.data[1 * 3 + 2];
            let b20 = _b.data[2 * 3 + 0];
            let b21 = _b.data[2 * 3 + 1];
            let b22 = _b.data[2 * 3 + 2];
            let matrix = new Matrix3x3;
            matrix.data = [
                b00 * a00 + b01 * a10 + b02 * a20,
                b00 * a01 + b01 * a11 + b02 * a21,
                b00 * a02 + b01 * a12 + b02 * a22,
                b10 * a00 + b11 * a10 + b12 * a20,
                b10 * a01 + b11 * a11 + b12 * a21,
                b10 * a02 + b11 * a12 + b12 * a22,
                b20 * a00 + b21 * a10 + b22 * a20,
                b20 * a01 + b21 * a11 + b22 * a21,
                b20 * a02 + b21 * a12 + b22 * a22
            ];
            return matrix;
        }
        translation(_xTranslation, _yTranslation) {
            let matrix = new Matrix3x3;
            matrix.data = [
                1, 0, 0,
                0, 1, 0,
                _xTranslation, _yTranslation, 1
            ];
            return matrix;
        }
        scaling(_xScale, _yScale) {
            let matrix = new Matrix3x3;
            matrix.data = [
                _xScale, 0, 0,
                0, _yScale, 0,
                0, 0, 1
            ];
            return matrix;
        }
        rotation(_angleInDegrees) {
            let angleInDegrees = 360 - _angleInDegrees;
            let angleInRadians = angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            let matrix = new Matrix3x3;
            matrix.data = [
                cos, -sin, 0,
                sin, cos, 0,
                0, 0, 1
            ];
            return matrix;
        }
    }
    FudgeCore.Matrix3x3 = Matrix3x3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Stores a 4x4 transformation matrix and provides operations for it.
     * ```plaintext
     * [ 0, 1, 2, 3 ] ← row vector x
     * [ 4, 5, 6, 7 ] ← row vector y
     * [ 8, 9,10,11 ] ← row vector z
     * [12,13,14,15 ] ← translation
     *            ↑  homogeneous column
     * ```
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix4x4 extends FudgeCore.Mutable {
        constructor() {
            super();
            this.data = new Float32Array(16); // The data of the matrix.
            this.mutator = null; // prepared for optimization, keep mutator to reduce redundant calculation and for comparison. Set to null when data changes!
            this.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            this.resetCache();
        }
        /**
         * - get: a copy of the calculated translation vector
         * - set: effect the matrix ignoring its rotation and scaling
         */
        get translation() {
            if (!this.vectors.translation)
                this.vectors.translation = new FudgeCore.Vector3(this.data[12], this.data[13], this.data[14]);
            return this.vectors.translation.copy;
        }
        set translation(_translation) {
            this.data.set(_translation.get(), 12);
            // no full cache reset required
            this.vectors.translation = _translation;
            this.mutator = null;
        }
        /**
         * - get: a copy of the calculated rotation vector
         * - set: effect the matrix
         */
        get rotation() {
            if (!this.vectors.rotation)
                this.vectors.rotation = this.getEulerAngles();
            return this.vectors.rotation.copy;
        }
        set rotation(_rotation) {
            this.mutate({ "rotation": _rotation });
            this.resetCache();
        }
        /**
         * - get: a copy of the calculated scale vector
         * - set: effect the matrix
         */
        get scaling() {
            if (!this.vectors.scaling)
                this.vectors.scaling = new FudgeCore.Vector3(Math.hypot(this.data[0], this.data[1], this.data[2]), Math.hypot(this.data[4], this.data[5], this.data[6]), Math.hypot(this.data[8], this.data[9], this.data[10]));
            return this.vectors.scaling.copy;
        }
        set scaling(_scaling) {
            this.mutate({ "scaling": _scaling });
            this.resetCache();
        }
        //#region STATICS
        /**
         * Retrieve a new identity matrix
         */
        static get IDENTITY() {
            // const result: Matrix4x4 = new Matrix4x4();
            const result = FudgeCore.Recycler.get(Matrix4x4);
            result.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return result;
        }
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        static MULTIPLICATION(_a, _b) {
            let a = _a.data;
            let b = _b.data;
            // let matrix: Matrix4x4 = new Matrix4x4();
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            let a00 = a[0 * 4 + 0];
            let a01 = a[0 * 4 + 1];
            let a02 = a[0 * 4 + 2];
            let a03 = a[0 * 4 + 3];
            let a10 = a[1 * 4 + 0];
            let a11 = a[1 * 4 + 1];
            let a12 = a[1 * 4 + 2];
            let a13 = a[1 * 4 + 3];
            let a20 = a[2 * 4 + 0];
            let a21 = a[2 * 4 + 1];
            let a22 = a[2 * 4 + 2];
            let a23 = a[2 * 4 + 3];
            let a30 = a[3 * 4 + 0];
            let a31 = a[3 * 4 + 1];
            let a32 = a[3 * 4 + 2];
            let a33 = a[3 * 4 + 3];
            let b00 = b[0 * 4 + 0];
            let b01 = b[0 * 4 + 1];
            let b02 = b[0 * 4 + 2];
            let b03 = b[0 * 4 + 3];
            let b10 = b[1 * 4 + 0];
            let b11 = b[1 * 4 + 1];
            let b12 = b[1 * 4 + 2];
            let b13 = b[1 * 4 + 3];
            let b20 = b[2 * 4 + 0];
            let b21 = b[2 * 4 + 1];
            let b22 = b[2 * 4 + 2];
            let b23 = b[2 * 4 + 3];
            let b30 = b[3 * 4 + 0];
            let b31 = b[3 * 4 + 1];
            let b32 = b[3 * 4 + 2];
            let b33 = b[3 * 4 + 3];
            matrix.data.set([
                b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
                b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
                b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
                b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
                b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
                b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
                b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
                b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
                b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
                b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
                b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
                b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
                b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
                b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
                b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
                b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
            ]);
            return matrix;
        }
        /**
         * Computes and returns the inverse of a passed matrix.
         * @param _matrix The matrix to compute the inverse of.
         */
        static INVERSION(_matrix) {
            let m = _matrix.data;
            let m00 = m[0 * 4 + 0];
            let m01 = m[0 * 4 + 1];
            let m02 = m[0 * 4 + 2];
            let m03 = m[0 * 4 + 3];
            let m10 = m[1 * 4 + 0];
            let m11 = m[1 * 4 + 1];
            let m12 = m[1 * 4 + 2];
            let m13 = m[1 * 4 + 3];
            let m20 = m[2 * 4 + 0];
            let m21 = m[2 * 4 + 1];
            let m22 = m[2 * 4 + 2];
            let m23 = m[2 * 4 + 3];
            let m30 = m[3 * 4 + 0];
            let m31 = m[3 * 4 + 1];
            let m32 = m[3 * 4 + 2];
            let m33 = m[3 * 4 + 3];
            let tmp0 = m22 * m33;
            let tmp1 = m32 * m23;
            let tmp2 = m12 * m33;
            let tmp3 = m32 * m13;
            let tmp4 = m12 * m23;
            let tmp5 = m22 * m13;
            let tmp6 = m02 * m33;
            let tmp7 = m32 * m03;
            let tmp8 = m02 * m23;
            let tmp9 = m22 * m03;
            let tmp10 = m02 * m13;
            let tmp11 = m12 * m03;
            let tmp12 = m20 * m31;
            let tmp13 = m30 * m21;
            let tmp14 = m10 * m31;
            let tmp15 = m30 * m11;
            let tmp16 = m10 * m21;
            let tmp17 = m20 * m11;
            let tmp18 = m00 * m31;
            let tmp19 = m30 * m01;
            let tmp20 = m00 * m21;
            let tmp21 = m20 * m01;
            let tmp22 = m00 * m11;
            let tmp23 = m10 * m01;
            let t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) -
                (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
            let t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) -
                (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
            let t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) -
                (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
            let t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) -
                (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);
            let d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
            // let matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
                d * t0,
                d * t1,
                d * t2,
                d * t3,
                d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) - (tmp0 * m10 + tmp3 * m20 + tmp4 * m30)),
                d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) - (tmp1 * m00 + tmp6 * m20 + tmp9 * m30)),
                d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) - (tmp2 * m00 + tmp7 * m10 + tmp10 * m30)),
                d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) - (tmp5 * m00 + tmp8 * m10 + tmp11 * m20)),
                d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) - (tmp13 * m13 + tmp14 * m23 + tmp17 * m33)),
                d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) - (tmp12 * m03 + tmp19 * m23 + tmp20 * m33)),
                d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) - (tmp15 * m03 + tmp18 * m13 + tmp23 * m33)),
                d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) - (tmp16 * m03 + tmp21 * m13 + tmp22 * m23)),
                d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) - (tmp16 * m32 + tmp12 * m12 + tmp15 * m22)),
                d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) - (tmp18 * m22 + tmp21 * m32 + tmp13 * m02)),
                d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) - (tmp22 * m32 + tmp14 * m02 + tmp19 * m12)),
                d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02)) // [15]
            ]);
            return matrix;
        }
        /**
         * Computes and returns a rotationmatrix that aligns a transformations z-axis with the vector between it and its target.
         * @param _transformPosition The x,y and z-coordinates of the object to rotate.
         * @param _targetPosition The position to look at.
         */
        static LOOK_AT(_transformPosition, _targetPosition, _up = FudgeCore.Vector3.Y()) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            let zAxis = FudgeCore.Vector3.DIFFERENCE(_transformPosition, _targetPosition);
            zAxis.normalize();
            let xAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(_up, zAxis));
            let yAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(zAxis, xAxis));
            matrix.data.set([
                xAxis.x, xAxis.y, xAxis.z, 0,
                yAxis.x, yAxis.y, yAxis.z, 0,
                zAxis.x, zAxis.y, zAxis.z, 0,
                _transformPosition.x,
                _transformPosition.y,
                _transformPosition.z,
                1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given vector.
         */
        static TRANSLATION(_translate) {
            // let matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _translate.x, _translate.y, _translate.z, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION_X(_angleInDegrees) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data.set([
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION_Y(_angleInDegrees) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            let matrix = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data.set([
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION_Z(_angleInDegrees) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data.set([
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given vector
         */
        static SCALING(_scalar) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
                _scalar.x, 0, 0, 0,
                0, _scalar.y, 0, 0,
                0, 0, _scalar.z, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        //#endregion
        //#region PROJECTIONS
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace border on the z-axis.
         * @param _direction The plane on which the fieldOfView-Angle is given
         */
        static PROJECTION_CENTRAL(_aspect, _fieldOfViewInDegrees, _near, _far, _direction) {
            let fieldOfViewInRadians = _fieldOfViewInDegrees * Math.PI / 180;
            let f = Math.tan(0.5 * (Math.PI - fieldOfViewInRadians));
            let rangeInv = 1.0 / (_near - _far);
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
                f, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (_near + _far) * rangeInv, -1,
                0, 0, _near * _far * rangeInv * 2, 0
            ]);
            if (_direction == FudgeCore.FIELD_OF_VIEW.DIAGONAL) {
                _aspect = Math.sqrt(_aspect);
                matrix.data[0] = f / _aspect;
                matrix.data[5] = f * _aspect;
            }
            else if (_direction == FudgeCore.FIELD_OF_VIEW.VERTICAL)
                matrix.data[0] = f / _aspect;
            else //FOV_DIRECTION.HORIZONTAL
                matrix.data[5] = f * _aspect;
            return matrix;
        }
        /**
         * Computes and returns a matrix that applies orthographic projection to an object, if its transform is multiplied by it.
         * @param _left The positionvalue of the projectionspace's left border.
         * @param _right The positionvalue of the projectionspace's right border.
         * @param _bottom The positionvalue of the projectionspace's bottom border.
         * @param _top The positionvalue of the projectionspace's top border.
         * @param _near The positionvalue of the projectionspace's near border.
         * @param _far The positionvalue of the projectionspace's far border
         */
        static PROJECTION_ORTHOGRAPHIC(_left, _right, _bottom, _top, _near = -400, _far = 400) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
                2 / (_right - _left), 0, 0, 0,
                0, 2 / (_top - _bottom), 0, 0,
                0, 0, 2 / (_near - _far), 0,
                (_left + _right) / (_left - _right),
                (_bottom + _top) / (_bottom - _top),
                (_near + _far) / (_near - _far),
                1
            ]);
            return matrix;
        }
        //#endregion
        //#region Rotation
        /**
         * Rotate this matrix by given vector in the order Z, Y, X. Right hand rotation is used, thumb points in axis direction, fingers curling indicate rotation
         * @param _by
         */
        rotate(_by) {
            this.rotateZ(_by.z);
            this.rotateY(_by.y);
            this.rotateX(_by.x);
        }
        /**
         * Adds a rotation around the x-Axis to this matrix
         */
        rotateX(_angleInDegrees) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.ROTATION_X(_angleInDegrees));
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Adds a rotation around the y-Axis to this matrix
         */
        rotateY(_angleInDegrees) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.ROTATION_Y(_angleInDegrees));
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Adds a rotation around the z-Axis to this matrix
         */
        rotateZ(_angleInDegrees) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.ROTATION_Z(_angleInDegrees));
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Adjusts the rotation of this matrix to face the given target and tilts it to accord with the given up vector
         */
        lookAt(_target, _up = FudgeCore.Vector3.Y()) {
            const matrix = Matrix4x4.LOOK_AT(this.translation, _target); // TODO: Handle rotation around z-axis
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        //#endregion
        //#region Translation
        /**
         * Add a translation by the given vector to this matrix
         */
        translate(_by) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.TRANSLATION(_by));
            // TODO: possible optimization, translation may alter mutator instead of deleting it.
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Add a translation along the x-Axis by the given amount to this matrix
         */
        translateX(_x) {
            this.data[12] += _x;
            this.mutator = null;
        }
        /**
         * Add a translation along the y-Axis by the given amount to this matrix
         */
        translateY(_y) {
            this.data[13] += _y;
            this.mutator = null;
        }
        /**
         * Add a translation along the y-Axis by the given amount to this matrix
         */
        translateZ(_z) {
            this.data[14] += _z;
            this.mutator = null;
        }
        //#endregion
        //#region Scaling
        /**
         * Add a scaling by the given vector to this matrix
         */
        scale(_by) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.SCALING(_by));
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Add a scaling along the x-Axis by the given amount to this matrix
         */
        scaleX(_by) {
            this.scale(new FudgeCore.Vector3(_by, 1, 1));
        }
        /**
         * Add a scaling along the y-Axis by the given amount to this matrix
         */
        scaleY(_by) {
            this.scale(new FudgeCore.Vector3(1, _by, 1));
        }
        /**
         * Add a scaling along the z-Axis by the given amount to this matrix
         */
        scaleZ(_by) {
            this.scale(new FudgeCore.Vector3(1, 1, _by));
        }
        //#endregion
        //#region Transformation
        /**
         * Multiply this matrix with the given matrix
         */
        multiply(_matrix) {
            this.set(Matrix4x4.MULTIPLICATION(this, _matrix));
            this.mutator = null;
        }
        //#endregion
        //#region Transfer
        /**
         * Calculates and returns the euler-angles representing the current rotation of this matrix
         */
        getEulerAngles() {
            let scaling = this.scaling;
            let s0 = this.data[0] / scaling.x;
            let s1 = this.data[1] / scaling.x;
            let s2 = this.data[2] / scaling.x;
            let s6 = this.data[6] / scaling.y;
            let s10 = this.data[10] / scaling.z;
            let sy = Math.hypot(s0, s1); // probably 2. param should be this.data[4] / scaling.y
            let singular = sy < 1e-6; // If
            let x1, y1, z1;
            let x2, y2, z2;
            if (!singular) {
                x1 = Math.atan2(s6, s10);
                y1 = Math.atan2(-s2, sy);
                z1 = Math.atan2(s1, s0);
                x2 = Math.atan2(-s6, -s10);
                y2 = Math.atan2(-s2, -sy);
                z2 = Math.atan2(-s1, -s0);
                if (Math.abs(x2) + Math.abs(y2) + Math.abs(z2) < Math.abs(x1) + Math.abs(y1) + Math.abs(z1)) {
                    x1 = x2;
                    y1 = y2;
                    z1 = z2;
                }
            }
            else {
                x1 = Math.atan2(-this.data[9] / scaling.z, this.data[5] / scaling.y);
                y1 = Math.atan2(-this.data[2] / scaling.x, sy);
                z1 = 0;
            }
            let rotation = new FudgeCore.Vector3(x1, y1, z1);
            rotation.scale(180 / Math.PI);
            return rotation;
        }
        /**
         * Sets the elements of this matrix to the values of the given matrix
         */
        set(_to) {
            // this.data = _to.get();
            this.data.set(_to.data);
            this.resetCache();
        }
        /**
         * Return the elements of this matrix as a Float32Array
         */
        get() {
            return new Float32Array(this.data);
        }
        serialize() {
            // TODO: save translation, rotation and scale as vectors for readability and manipulation
            let serialization = this.getMutator();
            return serialization;
        }
        deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
        getMutator() {
            if (this.mutator)
                return this.mutator;
            let mutator = {
                translation: this.translation.getMutator(),
                rotation: this.rotation.getMutator(),
                scaling: this.scaling.getMutator()
            };
            // cache mutator
            this.mutator = mutator;
            return mutator;
        }
        mutate(_mutator) {
            let oldTranslation = this.translation;
            let oldRotation = this.rotation;
            let oldScaling = this.scaling;
            let newTranslation = _mutator["translation"];
            let newRotation = _mutator["rotation"];
            let newScaling = _mutator["scaling"];
            let vectors = { translation: oldTranslation, rotation: oldRotation, scaling: oldScaling };
            if (newTranslation) {
                vectors.translation = new FudgeCore.Vector3(newTranslation.x != undefined ? newTranslation.x : oldTranslation.x, newTranslation.y != undefined ? newTranslation.y : oldTranslation.y, newTranslation.z != undefined ? newTranslation.z : oldTranslation.z);
            }
            if (newRotation) {
                vectors.rotation = new FudgeCore.Vector3(newRotation.x != undefined ? newRotation.x : oldRotation.x, newRotation.y != undefined ? newRotation.y : oldRotation.y, newRotation.z != undefined ? newRotation.z : oldRotation.z);
            }
            if (newScaling) {
                vectors.scaling = new FudgeCore.Vector3(newScaling.x != undefined ? newScaling.x : oldScaling.x, newScaling.y != undefined ? newScaling.y : oldScaling.y, newScaling.z != undefined ? newScaling.z : oldScaling.z);
            }
            // TODO: possible performance optimization when only one or two components change, then use old matrix instead of IDENTITY and transform by differences/quotients
            let matrix = Matrix4x4.IDENTITY;
            if (vectors.translation)
                matrix.translate(vectors.translation);
            if (vectors.rotation) {
                matrix.rotateZ(vectors.rotation.z);
                matrix.rotateY(vectors.rotation.y);
                matrix.rotateX(vectors.rotation.x);
            }
            if (vectors.scaling)
                matrix.scale(vectors.scaling);
            this.set(matrix);
            this.vectors = vectors;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            if (_mutator.translation)
                types.translation = "Vector3";
            if (_mutator.rotation)
                types.rotation = "Vector3";
            if (_mutator.scaling)
                types.scaling = "Vector3";
            return types;
        }
        reduceMutator(_mutator) { }
        resetCache() {
            this.vectors = { translation: null, rotation: null, scaling: null };
            this.mutator = null;
        }
    }
    FudgeCore.Matrix4x4 = Matrix4x4;
    //#endregion
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Defines the origin of a rectangle
     */
    let ORIGIN2D;
    (function (ORIGIN2D) {
        ORIGIN2D[ORIGIN2D["TOPLEFT"] = 0] = "TOPLEFT";
        ORIGIN2D[ORIGIN2D["TOPCENTER"] = 1] = "TOPCENTER";
        ORIGIN2D[ORIGIN2D["TOPRIGHT"] = 2] = "TOPRIGHT";
        ORIGIN2D[ORIGIN2D["CENTERLEFT"] = 16] = "CENTERLEFT";
        ORIGIN2D[ORIGIN2D["CENTER"] = 17] = "CENTER";
        ORIGIN2D[ORIGIN2D["CENTERRIGHT"] = 18] = "CENTERRIGHT";
        ORIGIN2D[ORIGIN2D["BOTTOMLEFT"] = 32] = "BOTTOMLEFT";
        ORIGIN2D[ORIGIN2D["BOTTOMCENTER"] = 33] = "BOTTOMCENTER";
        ORIGIN2D[ORIGIN2D["BOTTOMRIGHT"] = 34] = "BOTTOMRIGHT";
    })(ORIGIN2D = FudgeCore.ORIGIN2D || (FudgeCore.ORIGIN2D = {}));
    /**
     * Defines a rectangle with position and size and add comfortable methods to it
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Rectangle extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            super();
            this.position = FudgeCore.Recycler.get(FudgeCore.Vector2);
            this.size = FudgeCore.Recycler.get(FudgeCore.Vector2);
            this.setPositionAndSize(_x, _y, _width, _height, _origin);
        }
        /**
         * Returns a new rectangle created with the given parameters
         */
        static GET(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            let rect = FudgeCore.Recycler.get(Rectangle);
            rect.setPositionAndSize(_x, _y, _width, _height);
            return rect;
        }
        /**
         * Sets the position and size of the rectangle according to the given parameters
         */
        setPositionAndSize(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            this.size.set(_width, _height);
            switch (_origin & 0x03) {
                case 0x00:
                    this.position.x = _x;
                    break;
                case 0x01:
                    this.position.x = _x - _width / 2;
                    break;
                case 0x02:
                    this.position.x = _x - _width;
                    break;
            }
            switch (_origin & 0x30) {
                case 0x00:
                    this.position.y = _y;
                    break;
                case 0x10:
                    this.position.y = _y - _height / 2;
                    break;
                case 0x20:
                    this.position.y = _y - _height;
                    break;
            }
        }
        get x() {
            return this.position.x;
        }
        get y() {
            return this.position.y;
        }
        get width() {
            return this.size.x;
        }
        get height() {
            return this.size.y;
        }
        get left() {
            return this.position.x;
        }
        get top() {
            return this.position.y;
        }
        get right() {
            return this.position.x + this.size.x;
        }
        get bottom() {
            return this.position.y + this.size.y;
        }
        set x(_x) {
            this.position.x = _x;
        }
        set y(_y) {
            this.position.y = _y;
        }
        set width(_width) {
            this.position.x = _width;
        }
        set height(_height) {
            this.position.y = _height;
        }
        set left(_value) {
            this.size.x = this.right - _value;
            this.position.x = _value;
        }
        set top(_value) {
            this.size.y = this.bottom - _value;
            this.position.y = _value;
        }
        set right(_value) {
            this.size.x = this.position.x + _value;
        }
        set bottom(_value) {
            this.size.y = this.position.y + _value;
        }
        /**
         * Returns true if the given point is inside of this rectangle or on the border
         * @param _point
         */
        isInside(_point) {
            return (_point.x >= this.left && _point.x <= this.right && _point.y >= this.top && _point.y <= this.bottom);
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Rectangle = Rectangle;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Stores and manipulates a twodimensional vector comprised of the components x and y
     * ```plaintext
     *            +y
     *             |__ +x
     * ```
     * @authors Lukas Scheuerle, HFU, 2019
     */
    class Vector2 extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0) {
            super();
            this.data = new Float32Array([_x, _y]);
        }
        get x() {
            return this.data[0];
        }
        get y() {
            return this.data[1];
        }
        set x(_x) {
            this.data[0] = _x;
        }
        set y(_y) {
            this.data[1] = _y;
        }
        /**
         * A shorthand for writing `new Vector2(0, 0)`.
         * @returns A new vector with the values (0, 0)
         */
        static ZERO() {
            let vector = new Vector2();
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(_scale, _scale)`.
         * @param _scale the scale of the vector. Default: 1
         */
        static ONE(_scale = 1) {
            let vector = new Vector2(_scale, _scale);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(0, y)`.
         * @param _scale The number to write in the y coordinate. Default: 1
         * @returns A new vector with the values (0, _scale)
         */
        static Y(_scale = 1) {
            let vector = new Vector2(0, _scale);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(x, 0)`.
         * @param _scale The number to write in the x coordinate. Default: 1
         * @returns A new vector with the values (_scale, 0)
         */
        static X(_scale = 1) {
            let vector = new Vector2(_scale, 0);
            return vector;
        }
        /**
         * Normalizes a given vector to the given length without editing the original vector.
         * @param _vector the vector to normalize
         * @param _length the length of the resulting vector. defaults to 1
         * @returns a new vector representing the normalised vector scaled by the given length
         */
        static NORMALIZATION(_vector, _length = 1) {
            let vector = Vector2.ZERO();
            try {
                let [x, y] = _vector.data;
                let factor = _length / Math.hypot(x, y);
                vector.data = new Float32Array([_vector.x * factor, _vector.y * factor]);
            }
            catch (_e) {
                console.warn(_e);
            }
            return vector;
        }
        /**
         * Scales a given vector by a given scale without changing the original vector
         * @param _vector The vector to scale.
         * @param _scale The scale to scale with.
         * @returns A new vector representing the scaled version of the given vector
         */
        static SCALE(_vector, _scale) {
            let vector = new Vector2();
            return vector;
        }
        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        static SUM(..._vectors) {
            let result = new Vector2();
            for (let vector of _vectors)
                result.data = new Float32Array([result.x + vector.x, result.y + vector.y]);
            return result;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static DIFFERENCE(_a, _b) {
            let vector = new Vector2;
            vector.data = new Float32Array([_a.x - _b.x, _a.y - _b.y]);
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static DOT(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y;
            return scalarProduct;
        }
        /**
         * Returns the magnitude of a given vector.
         * If you only need to compare magnitudes of different vectors, you can compare squared magnitudes using Vector2.MAGNITUDESQR instead.
         * @see Vector2.MAGNITUDESQR
         * @param _vector The vector to get the magnitude of.
         * @returns A number representing the magnitude of the given vector.
         */
        static MAGNITUDE(_vector) {
            let magnitude = Math.sqrt(Vector2.MAGNITUDESQR(_vector));
            return magnitude;
        }
        /**
         * Returns the squared magnitude of a given vector. Much less calculation intensive than Vector2.MAGNITUDE, should be used instead if possible.
         * @param _vector The vector to get the squared magnitude of.
         * @returns A number representing the squared magnitude of the given vector.
         */
        static MAGNITUDESQR(_vector) {
            let magnitude = Vector2.DOT(_vector, _vector);
            return magnitude;
        }
        /**
         * Calculates the cross product of two Vectors. Due to them being only 2 Dimensional, the result is a single number,
         * which implicitly is on the Z axis. It is also the signed magnitude of the result.
         * @param _a Vector to compute the cross product on
         * @param _b Vector to compute the cross product with
         * @returns A number representing result of the cross product.
         */
        static CROSSPRODUCT(_a, _b) {
            let crossProduct = _a.x * _b.y - _a.y * _b.x;
            return crossProduct;
        }
        /**
         * Calculates the orthogonal vector to the given vector. Rotates counterclockwise by default.
         * ```plaintext
         *    ^                |
         *    |  =>  <--  =>   v  =>  -->
         * ```
         * @param _vector Vector to get the orthogonal equivalent of
         * @param _clockwise Should the rotation be clockwise instead of the default counterclockwise? default: false
         * @returns A Vector that is orthogonal to and has the same magnitude as the given Vector.
         */
        static ORTHOGONAL(_vector, _clockwise = false) {
            if (_clockwise)
                return new Vector2(_vector.y, -_vector.x);
            else
                return new Vector2(-_vector.y, _vector.x);
        }
        /**
         * Adds the given vector to the executing vector, changing the executor.
         * @param _addend The vector to add.
         */
        add(_addend) {
            this.data = new Vector2(_addend.x + this.x, _addend.y + this.y).data;
        }
        /**
         * Subtracts the given vector from the executing vector, changing the executor.
         * @param _subtrahend The vector to subtract.
         */
        subtract(_subtrahend) {
            this.data = new Vector2(this.x - _subtrahend.x, this.y - _subtrahend.y).data;
        }
        /**
         * Scales the Vector by the _scale.
         * @param _scale The scale to multiply the vector with.
         */
        scale(_scale) {
            this.data = new Vector2(_scale * this.x, _scale * this.y).data;
        }
        /**
         * Normalizes the vector.
         * @param _length A modificator to get a different length of normalized vector.
         */
        normalize(_length = 1) {
            this.data = Vector2.NORMALIZATION(this, _length).data;
        }
        /**
         * Sets the Vector to the given parameters. Ommitted parameters default to 0.
         * @param _x new x to set
         * @param _y new y to set
         */
        set(_x = 0, _y = 0) {
            this.data = new Float32Array([_x, _y]);
        }
        /**
         * Checks whether the given Vector is equal to the executed Vector.
         * @param _vector The vector to comapre with.
         * @returns true if the two vectors are equal, otherwise false
         */
        equals(_vector) {
            if (this.data[0] == _vector.data[0] && this.data[1] == _vector.data[1])
                return true;
            return false;
        }
        /**
         * @returns An array of the data of the vector
         */
        get() {
            return new Float32Array(this.data);
        }
        /**
         * @returns A deep copy of the vector.
         */
        get copy() {
            return new Vector2(this.x, this.y);
        }
        /**
         * Adds a z-component to the vector and returns a new Vector3
         */
        toVector3() {
            return new FudgeCore.Vector3(this.x, this.y, 0);
        }
        getMutator() {
            let mutator = {
                x: this.data[0], y: this.data[1]
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Vector2 = Vector2;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Stores and manipulates a threedimensional vector comprised of the components x, y and z
     * ```plaintext
     *            +y
     *             |__ +x
     *            /
     *          +z
     * ```
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Vector3 extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0, _z = 0) {
            super();
            this.data = new Float32Array([_x, _y, _z]);
        }
        // TODO: implement equals-functions
        get x() {
            return this.data[0];
        }
        get y() {
            return this.data[1];
        }
        get z() {
            return this.data[2];
        }
        set x(_x) {
            this.data[0] = _x;
        }
        set y(_y) {
            this.data[1] = _y;
        }
        set z(_z) {
            this.data[2] = _z;
        }
        static X(_scale = 1) {
            const vector = new Vector3(_scale, 0, 0);
            return vector;
        }
        static Y(_scale = 1) {
            const vector = new Vector3(0, _scale, 0);
            return vector;
        }
        static Z(_scale = 1) {
            const vector = new Vector3(0, 0, _scale);
            return vector;
        }
        static ZERO() {
            const vector = new Vector3(0, 0, 0);
            return vector;
        }
        static ONE(_scale = 1) {
            const vector = new Vector3(_scale, _scale, _scale);
            return vector;
        }
        static TRANSFORMATION(_vector, _matrix, _includeTranslation = true) {
            let result = new Vector3();
            let m = _matrix.get();
            let [x, y, z] = _vector.get();
            result.x = m[0] * x + m[4] * y + m[8] * z;
            result.y = m[1] * x + m[5] * y + m[9] * z;
            result.z = m[2] * x + m[6] * y + m[10] * z;
            if (_includeTranslation) {
                result.add(_matrix.translation);
            }
            return result;
        }
        static NORMALIZATION(_vector, _length = 1) {
            let vector = Vector3.ZERO();
            try {
                let [x, y, z] = _vector.data;
                let factor = _length / Math.hypot(x, y, z);
                vector.data = new Float32Array([_vector.x * factor, _vector.y * factor, _vector.z * factor]);
            }
            catch (_e) {
                FudgeCore.Debug.warn(_e);
            }
            return vector;
        }
        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        static SUM(..._vectors) {
            let result = new Vector3();
            for (let vector of _vectors)
                result.data = new Float32Array([result.x + vector.x, result.y + vector.y, result.z + vector.z]);
            return result;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static DIFFERENCE(_a, _b) {
            let vector = new Vector3;
            vector.data = new Float32Array([_a.x - _b.x, _a.y - _b.y, _a.z - _b.z]);
            return vector;
        }
        /**
         * Returns a new vector representing the given vector scaled by the given scaling factor
         */
        static SCALE(_vector, _scaling) {
            let scaled = new Vector3();
            scaled.data = new Float32Array([_vector.x * _scaling, _vector.y * _scaling, _vector.z * _scaling]);
            return scaled;
        }
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the crossproduct of the given vectors
         */
        static CROSS(_a, _b) {
            let vector = new Vector3;
            vector.data = new Float32Array([
                _a.y * _b.z - _a.z * _b.y,
                _a.z * _b.x - _a.x * _b.z,
                _a.x * _b.y - _a.y * _b.x
            ]);
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static DOT(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y + _a.z * _b.z;
            return scalarProduct;
        }
        /**
         * Calculates and returns the reflection of the incoming vector at the given normal vector. The length of normal should be 1.
         *     __________________
         *           /|\
         * incoming / | \ reflection
         *         /  |  \
         *          normal
         *
         */
        static REFLECTION(_incoming, _normal) {
            let dot = -Vector3.DOT(_incoming, _normal);
            let reflection = Vector3.SUM(_incoming, Vector3.SCALE(_normal, 2 * dot));
            return reflection;
        }
        add(_addend) {
            this.data = new Vector3(_addend.x + this.x, _addend.y + this.y, _addend.z + this.z).data;
        }
        subtract(_subtrahend) {
            this.data = new Vector3(this.x - _subtrahend.x, this.y - _subtrahend.y, this.z - _subtrahend.z).data;
        }
        scale(_scale) {
            this.data = new Vector3(_scale * this.x, _scale * this.y, _scale * this.z).data;
        }
        normalize(_length = 1) {
            this.data = Vector3.NORMALIZATION(this, _length).data;
        }
        set(_x = 0, _y = 0, _z = 0) {
            this.data = new Float32Array([_x, _y, _z]);
        }
        get() {
            return new Float32Array(this.data);
        }
        get copy() {
            return new Vector3(this.x, this.y, this.z);
        }
        transform(_matrix, _includeTranslation = true) {
            this.data = Vector3.TRANSFORMATION(this, _matrix, _includeTranslation).data;
        }
        /**
         * Drops the z-component and returns a Vector2 consisting of the x- and y-components
         */
        toVector2() {
            return new FudgeCore.Vector2(this.x, this.y);
        }
        reflect(_normal) {
            const reflected = Vector3.REFLECTION(this, _normal);
            this.set(reflected.x, reflected.y, reflected.z);
            FudgeCore.Recycler.store(reflected);
        }
        getMutator() {
            let mutator = {
                x: this.data[0], y: this.data[1], z: this.data[2]
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Vector3 = Vector3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Abstract base class for all meshes.
     * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Mesh {
        constructor() {
            this.idResource = undefined;
        }
        static getBufferSpecification() {
            return { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 };
        }
        getVertexCount() {
            return this.vertices.length / Mesh.getBufferSpecification().size;
        }
        getIndexCount() {
            return this.indices.length;
        }
        // Serialize/Deserialize for all meshes that calculate without parameters
        serialize() {
            let serialization = {
                idResource: this.idResource
            }; // no data needed ...
            return serialization;
        }
        deserialize(_serialization) {
            this.create(); // TODO: must not be created, if an identical mesh already exists
            this.idResource = _serialization.idResource;
            return this;
        }
    }
    FudgeCore.Mesh = Mesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate a simple cube with edges of length 1, each face consisting of two trigons
     * ```plaintext
     *            4____7
     *           0/__3/|
     *            ||5_||6
     *           1|/_2|/
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshCube extends FudgeCore.Mesh {
        constructor() {
            super();
            this.create();
        }
        create() {
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            this.textureUVs = this.createTextureUVs();
            this.normalsFace = this.createFaceNormals();
        }
        createVertices() {
            let vertices = new Float32Array([
                // First wrap
                // front
                /*0*/ -1, 1, 1, /*1*/ -1, -1, 1, /*2*/ 1, -1, 1, /*3*/ 1, 1, 1,
                // back
                /*4*/ -1, 1, -1, /* 5*/ -1, -1, -1, /* 6*/ 1, -1, -1, /* 7*/ 1, 1, -1,
                // Second wrap
                // front
                /*0*/ -1, 1, 1, /*1*/ -1, -1, 1, /*2*/ 1, -1, 1, /*3*/ 1, 1, 1,
                // back
                /*4*/ -1, 1, -1, /* 5*/ -1, -1, -1, /* 6*/ 1, -1, -1, /* 7*/ 1, 1, -1
            ]);
            // scale down to a length of 1 for all edges
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                // First wrap
                // front
                1, 2, 0, 2, 3, 0,
                // right
                2, 6, 3, 6, 7, 3,
                // back
                6, 5, 7, 5, 4, 7,
                // Second wrap
                // left
                5 + 8, 1 + 8, 4 + 8, 1 + 8, 0 + 8, 4 + 8,
                // top
                4 + 8, 0 + 8, 3 + 8, 7 + 8, 4 + 8, 3 + 8,
                // bottom
                5 + 8, 6 + 8, 1 + 8, 6 + 8, 2 + 8, 1 + 8
                /*,
                // left
                4, 5, 1, 4, 1, 0,
                // top
                4, 0, 3, 4, 3, 7,
                // bottom
                1, 5, 6, 1, 6, 2
                */
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                // First wrap
                // front
                /*0*/ 0, 0, /*1*/ 0, 1, /*2*/ 1, 1, /*3*/ 1, 0,
                // back
                /*4*/ 3, 0, /*5*/ 3, 1, /*6*/ 2, 1, /*7*/ 2, 0,
                // Second wrap
                // front
                /*0*/ 1, 0, /*1*/ 1, 1, /*2*/ 1, 2, /*3*/ 1, -1,
                // back
                /*4*/ 0, 0, /*5*/ 0, 1, /*6*/ 0, 2, /*7*/ 0, -1
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            let normals = new Float32Array([
                // for each triangle, the last vertex of the three defining refers to the normalvector when using flat shading
                // First wrap
                // front
                /*0*/ 0, 0, 1, /*1*/ 0, 0, 0, /*2*/ 0, 0, 0, /*3*/ 1, 0, 0,
                // back
                /*4*/ 0, 0, 0, /*5*/ 0, 0, 0, /*6*/ 0, 0, 0, /*7*/ 0, 0, -1,
                // Second wrap
                // front
                /*0*/ 0, 0, 0, /*1*/ 0, -1, 0, /*2*/ 0, 0, 0, /*3*/ 0, 1, 0,
                // back
                /*4*/ -1, 0, 0, /*5*/ 0, 0, 0, /*6*/ 0, 0, 0, /*7*/ 0, 0, 0
            ]);
            //normals = this.createVertices();
            return normals;
        }
    }
    FudgeCore.MeshCube = MeshCube;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate a simple pyramid with edges at the base of length 1 and a height of 1. The sides consisting of one, the base of two trigons
     * ```plaintext
     *               4
     *              /\`.
     *            3/__\_\ 2
     *           0/____\/1
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshPyramid extends FudgeCore.Mesh {
        constructor() {
            super();
            this.create();
        }
        create() {
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            this.textureUVs = this.createTextureUVs();
            this.normalsFace = this.createFaceNormals();
        }
        createVertices() {
            let vertices = new Float32Array([
                // floor
                /*0*/ -1, 0, 1, /*1*/ 1, 0, 1, /*2*/ 1, 0, -1, /*3*/ -1, 0, -1,
                // tip
                /*4*/ 0, 2, 0,
                // floor again for texturing and normals
                /*5*/ -1, 0, 1, /*6*/ 1, 0, 1, /*7*/ 1, 0, -1, /*8*/ -1, 0, -1
            ]);
            // scale down to a length of 1 for bottom edges and height
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                // front
                4, 0, 1,
                // right
                4, 1, 2,
                // back
                4, 2, 3,
                // left
                4, 3, 0,
                // bottom
                5 + 0, 5 + 2, 5 + 1, 5 + 0, 5 + 3, 5 + 2
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                // front
                /*0*/ 0, 1, /*1*/ 0.5, 1, /*2*/ 1, 1, /*3*/ 0.5, 1,
                // back
                /*4*/ 0.5, 0,
                /*5*/ 0, 0, /*6*/ 1, 0, /*7*/ 1, 1, /*8*/ 0, 1
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            let normals = [];
            let vertices = [];
            for (let v = 0; v < this.vertices.length; v += 3)
                vertices.push(new FudgeCore.Vector3(this.vertices[v], this.vertices[v + 1], this.vertices[v + 2]));
            for (let i = 0; i < this.indices.length; i += 3) {
                let vertex = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];
                let v0 = FudgeCore.Vector3.DIFFERENCE(vertices[vertex[0]], vertices[vertex[1]]);
                let v1 = FudgeCore.Vector3.DIFFERENCE(vertices[vertex[0]], vertices[vertex[2]]);
                let normal = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(v0, v1));
                let index = vertex[2] * 3;
                normals[index] = normal.x;
                normals[index + 1] = normal.y;
                normals[index + 2] = normal.z;
                // normals.push(normal.x, normal.y, normal.z);
            }
            normals.push(0, 0, 0);
            return new Float32Array(normals);
        }
    }
    FudgeCore.MeshPyramid = MeshPyramid;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate a simple quad with edges of length 1, the face consisting of two trigons
     * ```plaintext
     *        0 __ 3
     *         |__|
     *        1    2
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshQuad extends FudgeCore.Mesh {
        constructor() {
            super();
            this.create();
        }
        create() {
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            this.textureUVs = this.createTextureUVs();
            this.normalsFace = this.createFaceNormals();
        }
        createVertices() {
            let vertices = new Float32Array([
                /*0*/ -1, 1, 0, /*1*/ -1, -1, 0, /*2*/ 1, -1, 0, /*3*/ 1, 1, 0
            ]);
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                1, 2, 0, 2, 3, 0
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                // front
                /*0*/ 0, 0, /*1*/ 0, 1, /*2*/ 1, 1, /*3*/ 1, 0
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            return new Float32Array([
                /*0*/ 0, 0, 1, /*1*/ 0, 0, 0, /*2*/ 0, 0, 0, /*3*/ 1, 0, 0
            ]);
        }
    }
    FudgeCore.MeshQuad = MeshQuad;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Represents a node in the scenetree.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Node extends EventTarget {
        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        constructor(_name) {
            super();
            this.mtxWorld = FudgeCore.Matrix4x4.IDENTITY;
            this.timestampUpdate = 0;
            this.parent = null; // The parent of this node.
            this.children = []; // array of child nodes appended to this node.
            this.components = {};
            // private tags: string[] = []; // Names of tags that are attached to this node. (TODO: As of yet no functionality)
            // private layers: string[] = []; // Names of the layers this node is on. (TODO: As of yet no functionality)
            this.listeners = {};
            this.captures = {};
            this.name = _name;
        }
        /**
         * Returns a reference to this nodes parent node
         */
        getParent() {
            return this.parent;
        }
        /**
         * Traces back the ancestors of this node and returns the first
         */
        getAncestor() {
            let ancestor = this;
            while (ancestor.getParent())
                ancestor = ancestor.getParent();
            return ancestor;
        }
        /**
         * Shortcut to retrieve this nodes [[ComponentTransform]]
         */
        get cmpTransform() {
            return this.getComponents(FudgeCore.ComponentTransform)[0];
        }
        /**
         * Shortcut to retrieve the local [[Matrix4x4]] attached to this nodes [[ComponentTransform]]
         * Returns null if no [[ComponentTransform]] is attached
         */
        // TODO: rejected for now, since there is some computational overhead, so node.mtxLocal should not be used carelessly
        // public get mtxLocal(): Matrix4x4 {
        //     let cmpTransform: ComponentTransform = this.cmpTransform;
        //     if (cmpTransform)
        //         return cmpTransform.local;
        //     else
        //         return null;
        // }
        // #region Scenetree
        /**
         * Returns a clone of the list of children
         */
        getChildren() {
            return this.children.slice(0);
        }
        /**
         * Returns an array of references to childnodes with the supplied name.
         * @param _name The name of the nodes to be found.
         * @return An array with references to nodes
         */
        getChildrenByName(_name) {
            let found = [];
            found = this.children.filter((_node) => _node.name == _name);
            return found;
        }
        /**
         * Adds the given reference to a node to the list of children, if not already in
         * @param _node The node to be added as a child
         * @throws Error when trying to add an ancestor of this
         */
        appendChild(_node) {
            if (this.children.includes(_node))
                // _node is already a child of this
                return;
            let ancestor = this;
            while (ancestor) {
                if (ancestor == _node)
                    throw (new Error("Cyclic reference prohibited in node hierarchy, ancestors must not be added as children"));
                else
                    ancestor = ancestor.parent;
            }
            this.children.push(_node);
            _node.setParent(this);
            _node.dispatchEvent(new Event("childAdd" /* CHILD_APPEND */, { bubbles: true }));
        }
        /**
         * Removes the reference to the give node from the list of children
         * @param _node The node to be removed.
         */
        removeChild(_node) {
            let found = this.findChild(_node);
            if (found < 0)
                return;
            _node.dispatchEvent(new Event("childRemove" /* CHILD_REMOVE */, { bubbles: true }));
            this.children.splice(found, 1);
            _node.setParent(null);
        }
        /**
         * Returns the position of the node in the list of children or -1 if not found
         * @param _node The node to be found.
         */
        findChild(_node) {
            return this.children.indexOf(_node);
        }
        /**
         * Replaces a child node with another, preserving the position in the list of children
         * @param _replace The node to be replaced
         * @param _with The node to replace with
         */
        replaceChild(_replace, _with) {
            let found = this.findChild(_replace);
            if (found < 0)
                return false;
            let previousParent = _with.getParent();
            if (previousParent)
                previousParent.removeChild(_with);
            _replace.setParent(null);
            this.children[found] = _with;
            _with.setParent(this);
            return true;
        }
        /**
         * Generator yielding the node and all successors in the branch below for iteration
         */
        get branch() {
            return this.getBranchGenerator();
        }
        isUpdated(_timestampUpdate) {
            return (this.timestampUpdate == _timestampUpdate);
        }
        /**
         * Applies a Mutator from [[Animation]] to all its components and transfers it to its children.
         * @param _mutator The mutator generated from an [[Animation]]
         */
        applyAnimation(_mutator) {
            if (_mutator.components) {
                for (let componentName in _mutator.components) {
                    if (this.components[componentName]) {
                        let mutatorOfComponent = _mutator.components;
                        for (let i in mutatorOfComponent[componentName]) {
                            if (this.components[componentName][+i]) {
                                let componentToMutate = this.components[componentName][+i];
                                let mutatorArray = mutatorOfComponent[componentName];
                                let mutatorWithComponentName = mutatorArray[+i];
                                for (let cname in mutatorWithComponentName) { // trick used to get the only entry in the list
                                    let mutatorToGive = mutatorWithComponentName[cname];
                                    componentToMutate.mutate(mutatorToGive);
                                }
                            }
                        }
                    }
                }
            }
            if (_mutator.children) {
                for (let i = 0; i < _mutator.children.length; i++) {
                    let name = _mutator.children[i]["ƒ.Node"].name;
                    let childNodes = this.getChildrenByName(name);
                    for (let childNode of childNodes) {
                        childNode.applyAnimation(_mutator.children[i]["ƒ.Node"]);
                    }
                }
            }
        }
        // #endregion
        // #region Components
        /**
         * Returns a list of all components attached to this node, independent of type.
         */
        getAllComponents() {
            let all = [];
            for (let type in this.components) {
                all = all.concat(this.components[type]);
            }
            return all;
        }
        /**
         * Returns a clone of the list of components of the given class attached to this node.
         * @param _class The class of the components to be found.
         */
        getComponents(_class) {
            return (this.components[_class.name] || []).slice(0);
        }
        /**
         * Returns the first compontent found of the given class attached this node or null, if list is empty or doesn't exist
         * @param _class The class of the components to be found.
         */
        getComponent(_class) {
            let list = this.components[_class.name];
            if (list)
                return list[0];
            return null;
        }
        /**
         * Adds the supplied component into the nodes component map.
         * @param _component The component to be pushed into the array.
         */
        addComponent(_component) {
            if (_component.getContainer() == this)
                return;
            if (this.components[_component.type] === undefined)
                this.components[_component.type] = [_component];
            else if (_component.isSingleton)
                throw new Error("Component is marked singleton and can't be attached, no more than one allowed");
            else
                this.components[_component.type].push(_component);
            _component.setContainer(this);
            _component.dispatchEvent(new Event("componentAdd" /* COMPONENT_ADD */));
        }
        /**
         * Removes the given component from the node, if it was attached, and sets its parent to null.
         * @param _component The component to be removed
         * @throws Exception when component is not found
         */
        removeComponent(_component) {
            try {
                let componentsOfType = this.components[_component.type];
                let foundAt = componentsOfType.indexOf(_component);
                if (foundAt < 0)
                    return;
                componentsOfType.splice(foundAt, 1);
                _component.setContainer(null);
                _component.dispatchEvent(new Event("componentRemove" /* COMPONENT_REMOVE */));
            }
            catch {
                throw new Error(`Unable to remove component '${_component}'in node named '${this.name}'`);
            }
        }
        // #endregion
        // #region Serialization
        serialize() {
            let serialization = {
                name: this.name
            };
            let components = {};
            for (let type in this.components) {
                components[type] = [];
                for (let component of this.components[type]) {
                    // components[type].push(component.serialize());
                    components[type].push(FudgeCore.Serializer.serialize(component));
                }
            }
            serialization["components"] = components;
            let children = [];
            for (let child of this.children) {
                children.push(FudgeCore.Serializer.serialize(child));
            }
            serialization["children"] = children;
            this.dispatchEvent(new Event("nodeSerialized" /* NODE_SERIALIZED */));
            return serialization;
        }
        deserialize(_serialization) {
            this.name = _serialization.name;
            // this.parent = is set when the nodes are added
            // deserialize components first so scripts can react to children being appended
            for (let type in _serialization.components) {
                for (let serializedComponent of _serialization.components[type]) {
                    let deserializedComponent = FudgeCore.Serializer.deserialize(serializedComponent);
                    this.addComponent(deserializedComponent);
                }
            }
            for (let serializedChild of _serialization.children) {
                let deserializedChild = FudgeCore.Serializer.deserialize(serializedChild);
                this.appendChild(deserializedChild);
            }
            this.dispatchEvent(new Event("nodeDeserialized" /* NODE_DESERIALIZED */));
            return this;
        }
        // #endregion
        // #region Events
        /**
         * Adds an event listener to the node. The given handler will be called when a matching event is passed to the node.
         * Deviating from the standard EventTarget, here the _handler must be a function and _capture is the only option.
         * @param _type The type of the event, should be an enumerated value of NODE_EVENT, can be any string
         * @param _handler The function to call when the event reaches this node
         * @param _capture When true, the listener listens in the capture phase, when the event travels deeper into the hierarchy of nodes.
         */
        addEventListener(_type, _handler, _capture = false) {
            if (_capture) {
                if (!this.captures[_type])
                    this.captures[_type] = [];
                this.captures[_type].push(_handler);
            }
            else {
                if (!this.listeners[_type])
                    this.listeners[_type] = [];
                this.listeners[_type].push(_handler);
            }
        }
        /**
         * Dispatches a synthetic event event to target. This implementation always returns true (standard: return true only if either event's cancelable attribute value is false or its preventDefault() method was not invoked)
         * The event travels into the hierarchy to this node dispatching the event, invoking matching handlers of the nodes ancestors listening to the capture phase,
         * than the matching handler of the target node in the target phase, and back out of the hierarchy in the bubbling phase, invoking appropriate handlers of the anvestors
         * @param _event The event to dispatch
         */
        dispatchEvent(_event) {
            let ancestors = [];
            let upcoming = this;
            // overwrite event target
            Object.defineProperty(_event, "target", { writable: true, value: this });
            // TODO: consider using Reflect instead of Object throughout. See also Render and Mutable...
            while (upcoming.parent)
                ancestors.push(upcoming = upcoming.parent);
            // capture phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.CAPTURING_PHASE });
            for (let i = ancestors.length - 1; i >= 0; i--) {
                let ancestor = ancestors[i];
                Object.defineProperty(_event, "currentTarget", { writable: true, value: ancestor });
                let captures = ancestor.captures[_event.type] || [];
                for (let handler of captures)
                    handler(_event);
            }
            if (!_event.bubbles)
                return true;
            // target phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.AT_TARGET });
            Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
            let listeners = this.listeners[_event.type] || [];
            for (let handler of listeners)
                handler(_event);
            // bubble phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.BUBBLING_PHASE });
            for (let i = 0; i < ancestors.length; i++) {
                let ancestor = ancestors[i];
                Object.defineProperty(_event, "currentTarget", { writable: true, value: ancestor });
                let listeners = ancestor.listeners[_event.type] || [];
                for (let handler of listeners)
                    handler(_event);
            }
            return true; //TODO: return a meaningful value, see documentation of dispatch event
        }
        /**
         * Broadcasts a synthetic event event to this node and from there to all nodes deeper in the hierarchy,
         * invoking matching handlers of the nodes listening to the capture phase. Watch performance when there are many nodes involved
         * @param _event The event to broadcast
         */
        broadcastEvent(_event) {
            // overwrite event target and phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.CAPTURING_PHASE });
            Object.defineProperty(_event, "target", { writable: true, value: this });
            this.broadcastEventRecursive(_event);
        }
        broadcastEventRecursive(_event) {
            // capture phase only
            Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
            let captures = this.captures[_event.type] || [];
            for (let handler of captures)
                handler(_event);
            // appears to be slower, astonishingly...
            // captures.forEach(function (handler: Function): void {
            //     handler(_event);
            // });
            // same for children
            for (let child of this.children) {
                child.broadcastEventRecursive(_event);
            }
        }
        // #endregion
        /**
         * Sets the parent of this node to be the supplied node. Will be called on the child that is appended to this node by appendChild().
         * @param _parent The parent to be set for this node.
         */
        setParent(_parent) {
            this.parent = _parent;
        }
        *getBranchGenerator() {
            yield this;
            for (let child of this.children)
                yield* child.branch;
        }
    }
    FudgeCore.Node = Node;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * A node managed by [[ResourceManager]] that functions as a template for [[NodeResourceInstance]]s
     */
    class NodeResource extends FudgeCore.Node {
        constructor() {
            super(...arguments);
            this.idResource = undefined;
        }
    }
    FudgeCore.NodeResource = NodeResource;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * An instance of a [[NodeResource]].
     * This node keeps a reference to its resource an can thus optimize serialization
     */
    class NodeResourceInstance extends FudgeCore.Node {
        constructor(_nodeResource) {
            super("NodeResourceInstance");
            /** id of the resource that instance was created from */
            // TODO: examine, if this should be a direct reference to the NodeResource, instead of the id
            this.idSource = undefined;
            if (_nodeResource)
                this.set(_nodeResource);
        }
        /**
         * Recreate this node from the [[NodeResource]] referenced
         */
        reset() {
            let resource = FudgeCore.ResourceManager.get(this.idSource);
            this.set(resource);
        }
        //TODO: optimize using the referenced NodeResource, serialize/deserialize only the differences
        serialize() {
            let serialization = super.serialize();
            serialization.idSource = this.idSource;
            return serialization;
        }
        deserialize(_serialization) {
            super.deserialize(_serialization);
            this.idSource = _serialization.idSource;
            return this;
        }
        /**
         * Set this node to be a recreation of the [[NodeResource]] given
         * @param _nodeResource
         */
        set(_nodeResource) {
            // TODO: examine, if the serialization should be stored in the NodeResource for optimization
            let serialization = FudgeCore.Serializer.serialize(_nodeResource);
            //Serializer.deserialize(serialization);
            for (let path in serialization) {
                this.deserialize(serialization[path]);
                break;
            }
            this.idSource = _nodeResource.idResource;
            this.dispatchEvent(new Event("nodeResourceInstantiated" /* NODERESOURCE_INSTANTIATED */));
        }
    }
    FudgeCore.NodeResourceInstance = NodeResourceInstance;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Ray {
        constructor(_direction = FudgeCore.Vector3.Z(-1), _origin = FudgeCore.Vector3.ZERO(), _length = 1) {
            this.origin = _origin;
            this.direction = _direction;
            this.length = _length;
        }
    }
    FudgeCore.Ray = Ray;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RayHit {
        constructor(_node = null, _face = 0, _zBuffer = 0) {
            this.node = _node;
            this.face = _face;
            this.zBuffer = _zBuffer;
        }
    }
    FudgeCore.RayHit = RayHit;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="RenderOperator.ts"/>
var FudgeCore;
/// <reference path="RenderOperator.ts"/>
(function (FudgeCore) {
    /**
     * This class manages the references to render data used by nodes.
     * Multiple nodes may refer to the same data via their references to shader, coat and mesh
     */
    class Reference {
        constructor(_reference) {
            this.count = 0;
            this.reference = _reference;
        }
        getReference() {
            return this.reference;
        }
        increaseCounter() {
            this.count++;
            return this.count;
        }
        decreaseCounter() {
            if (this.count == 0)
                throw (new Error("Negative reference counter"));
            this.count--;
            return this.count;
        }
    }
    /**
     * Manages the handling of the ressources that are going to be rendered by [[RenderOperator]].
     * Stores the references to the shader, the coat and the mesh used for each node registered.
     * With these references, the already buffered data is retrieved when rendering.
     */
    class RenderManager extends FudgeCore.RenderOperator {
        // #region Adding
        /**
         * Register the node for rendering. Create a reference for it and increase the matching render-data references or create them first if necessary
         * @param _node
         */
        static addNode(_node) {
            if (RenderManager.nodes.get(_node))
                return;
            let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
            if (!cmpMaterial)
                return;
            let shader = cmpMaterial.material.getShader();
            RenderManager.createReference(RenderManager.renderShaders, shader, RenderManager.createProgram);
            let coat = cmpMaterial.material.getCoat();
            RenderManager.createReference(RenderManager.renderCoats, coat, RenderManager.createParameter);
            let mesh = _node.getComponent(FudgeCore.ComponentMesh).mesh;
            RenderManager.createReference(RenderManager.renderBuffers, mesh, RenderManager.createBuffers);
            let nodeReferences = { shader: shader, coat: coat, mesh: mesh }; //, doneTransformToWorld: false };
            RenderManager.nodes.set(_node, nodeReferences);
        }
        /**
         * Register the node and its valid successors in the branch for rendering using [[addNode]]
         * @param _node
         * @returns false, if the given node has a current timestamp thus having being processed during latest RenderManager.update and no addition is needed
         */
        static addBranch(_node) {
            if (_node.isUpdated(RenderManager.timestampUpdate))
                return false;
            for (let node of _node.branch)
                try {
                    // may fail when some components are missing. TODO: cleanup
                    RenderManager.addNode(node);
                }
                catch (_e) {
                    FudgeCore.Debug.log(_e);
                }
            return true;
        }
        // #endregion
        // #region Removing
        /**
         * Unregister the node so that it won't be rendered any more. Decrease the render-data references and delete the node reference.
         * @param _node
         */
        static removeNode(_node) {
            let nodeReferences = RenderManager.nodes.get(_node);
            if (!nodeReferences)
                return;
            RenderManager.removeReference(RenderManager.renderShaders, nodeReferences.shader, RenderManager.deleteProgram);
            RenderManager.removeReference(RenderManager.renderCoats, nodeReferences.coat, RenderManager.deleteParameter);
            RenderManager.removeReference(RenderManager.renderBuffers, nodeReferences.mesh, RenderManager.deleteBuffers);
            RenderManager.nodes.delete(_node);
        }
        /**
         * Unregister the node and its valid successors in the branch to free renderer resources. Uses [[removeNode]]
         * @param _node
         */
        static removeBranch(_node) {
            for (let node of _node.branch)
                RenderManager.removeNode(node);
        }
        // #endregion
        // #region Updating
        /**
         * Reflect changes in the node concerning shader, coat and mesh, manage the render-data references accordingly and update the node references
         * @param _node
         */
        static updateNode(_node) {
            let nodeReferences = RenderManager.nodes.get(_node);
            if (!nodeReferences)
                return;
            let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
            let shader = cmpMaterial.material.getShader();
            if (shader !== nodeReferences.shader) {
                RenderManager.removeReference(RenderManager.renderShaders, nodeReferences.shader, RenderManager.deleteProgram);
                RenderManager.createReference(RenderManager.renderShaders, shader, RenderManager.createProgram);
                nodeReferences.shader = shader;
            }
            let coat = cmpMaterial.material.getCoat();
            if (coat !== nodeReferences.coat) {
                RenderManager.removeReference(RenderManager.renderCoats, nodeReferences.coat, RenderManager.deleteParameter);
                RenderManager.createReference(RenderManager.renderCoats, coat, RenderManager.createParameter);
                nodeReferences.coat = coat;
            }
            let mesh = (_node.getComponent(FudgeCore.ComponentMesh)).mesh;
            if (mesh !== nodeReferences.mesh) {
                RenderManager.removeReference(RenderManager.renderBuffers, nodeReferences.mesh, RenderManager.deleteBuffers);
                RenderManager.createReference(RenderManager.renderBuffers, mesh, RenderManager.createBuffers);
                nodeReferences.mesh = mesh;
            }
        }
        /**
         * Update the node and its valid successors in the branch using [[updateNode]]
         * @param _node
         */
        static updateBranch(_node) {
            for (let node of _node.branch)
                RenderManager.updateNode(node);
        }
        // #endregion
        // #region Lights
        /**
         * Viewports collect the lights relevant to the branch to render and calls setLights to pass the collection.
         * RenderManager passes it on to all shaders used that can process light
         * @param _lights
         */
        static setLights(_lights) {
            // let renderLights: RenderLights = RenderManager.createRenderLights(_lights);
            for (let entry of RenderManager.renderShaders) {
                let renderShader = entry[1].getReference();
                RenderManager.setLightsInShader(renderShader, _lights);
            }
            // debugger;
        }
        // #endregion
        // #region Rendering
        /**
         * Update all render data. After RenderManager, multiple viewports can render their associated data without updating the same data multiple times
         */
        static update() {
            RenderManager.timestampUpdate = performance.now();
            RenderManager.recalculateAllNodeTransforms();
        }
        /**
         * Clear the offscreen renderbuffer with the given [[Color]]
         * @param _color
         */
        static clear(_color = null) {
            RenderManager.crc3.clearColor(_color.r, _color.g, _color.b, _color.a);
            RenderManager.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
        }
        /**
         * Reset the offscreen framebuffer to the original RenderingContext
         */
        static resetFrameBuffer(_color = null) {
            RenderManager.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
        }
        /**
         * Draws the branch starting with the given [[Node]] using the camera given [[ComponentCamera]].
         * @param _node
         * @param _cmpCamera
         */
        static drawBranch(_node, _cmpCamera, _drawNode = RenderManager.drawNode) {
            if (_drawNode == RenderManager.drawNode)
                RenderManager.resetFrameBuffer();
            let finalTransform;
            let cmpMesh = _node.getComponent(FudgeCore.ComponentMesh);
            if (cmpMesh)
                finalTransform = FudgeCore.Matrix4x4.MULTIPLICATION(_node.mtxWorld, cmpMesh.pivot);
            else
                finalTransform = _node.mtxWorld; // caution, RenderManager is a reference...
            // multiply camera matrix
            let projection = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.ViewProjectionMatrix, finalTransform);
            _drawNode(_node, finalTransform, projection);
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                RenderManager.drawBranch(childNode, _cmpCamera, _drawNode); //, world);
            }
            FudgeCore.Recycler.store(projection);
            if (finalTransform != _node.mtxWorld)
                FudgeCore.Recycler.store(finalTransform);
        }
        //#region RayCast & Picking
        /**
         * Draws the branch for RayCasting starting with the given [[Node]] using the camera given [[ComponentCamera]].
         * @param _node
         * @param _cmpCamera
         */
        static drawBranchForRayCast(_node, _cmpCamera) {
            RenderManager.pickBuffers = [];
            if (!RenderManager.renderShaders.get(FudgeCore.ShaderRayCast))
                RenderManager.createReference(RenderManager.renderShaders, FudgeCore.ShaderRayCast, RenderManager.createProgram);
            RenderManager.drawBranch(_node, _cmpCamera, RenderManager.drawNodeForRayCast);
            RenderManager.resetFrameBuffer();
            return RenderManager.pickBuffers;
        }
        static pickNodeAt(_pos, _pickBuffers, _rect) {
            let hits = [];
            for (let pickBuffer of _pickBuffers) {
                RenderManager.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, pickBuffer.frameBuffer);
                // TODO: instead of reading all data and afterwards pick the pixel, read only the pixel!
                let data = new Uint8Array(_rect.width * _rect.height * 4);
                RenderManager.crc3.readPixels(0, 0, _rect.width, _rect.height, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, data);
                let pixel = _pos.x + _rect.width * _pos.y;
                let zBuffer = data[4 * pixel + 2] + data[4 * pixel + 3] / 256;
                let hit = new FudgeCore.RayHit(pickBuffer.node, 0, zBuffer);
                hits.push(hit);
            }
            return hits;
        }
        static drawNode(_node, _finalTransform, _projection) {
            let references = RenderManager.nodes.get(_node);
            if (!references)
                return; // TODO: deal with partial references
            let bufferInfo = RenderManager.renderBuffers.get(references.mesh).getReference();
            let coatInfo = RenderManager.renderCoats.get(references.coat).getReference();
            let shaderInfo = RenderManager.renderShaders.get(references.shader).getReference();
            RenderManager.draw(shaderInfo, bufferInfo, coatInfo, _finalTransform, _projection);
        }
        static drawNodeForRayCast(_node, _finalTransform, _projection) {
            // TODO: look into SSBOs!
            let target = RenderManager.getRayCastTexture();
            const framebuffer = RenderManager.crc3.createFramebuffer();
            // render to our targetTexture by binding the framebuffer
            RenderManager.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
            // attach the texture as the first color attachment
            const attachmentPoint = WebGL2RenderingContext.COLOR_ATTACHMENT0;
            RenderManager.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, attachmentPoint, WebGL2RenderingContext.TEXTURE_2D, target, 0);
            // set render target
            let references = RenderManager.nodes.get(_node);
            if (!references)
                return; // TODO: deal with partial references
            let pickBuffer = { node: _node, texture: target, frameBuffer: framebuffer };
            RenderManager.pickBuffers.push(pickBuffer);
            let bufferInfo = RenderManager.renderBuffers.get(references.mesh).getReference();
            RenderManager.drawForRayCast(RenderManager.pickBuffers.length, bufferInfo, _finalTransform, _projection);
            // make texture available to onscreen-display
            // IDEA: Iterate over textures, collect data if z indicates hit, sort by z
        }
        static getRayCastTexture() {
            // create to render to
            const targetTextureWidth = RenderManager.getViewportRectangle().width;
            const targetTextureHeight = RenderManager.getViewportRectangle().height;
            const targetTexture = RenderManager.crc3.createTexture();
            RenderManager.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, targetTexture);
            {
                const internalFormat = WebGL2RenderingContext.RGBA8;
                const format = WebGL2RenderingContext.RGBA;
                const type = WebGL2RenderingContext.UNSIGNED_BYTE;
                RenderManager.crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, internalFormat, targetTextureWidth, targetTextureHeight, 0, format, type, null);
                // set the filtering so we don't need mips
                RenderManager.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
                RenderManager.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
                RenderManager.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            }
            return targetTexture;
        }
        //#endregion
        //#region Transformation of branch
        /**
         * Recalculate the world matrix of all registered nodes respecting their hierarchical relation.
         */
        static recalculateAllNodeTransforms() {
            // inner function to be called in a for each node at the bottom of RenderManager function
            // function markNodeToBeTransformed(_nodeReferences: NodeReferences, _node: Node, _map: MapNodeToNodeReferences): void {
            //     _nodeReferences.doneTransformToWorld = false;
            // }
            // inner function to be called in a for each node at the bottom of RenderManager function
            let recalculateBranchContainingNode = (_nodeReferences, _node, _map) => {
                // find uppermost ancestor not recalculated yet
                let ancestor = _node;
                let parent;
                while (true) {
                    parent = ancestor.getParent();
                    if (!parent)
                        break;
                    if (_node.isUpdated(RenderManager.timestampUpdate))
                        break;
                    ancestor = parent;
                }
                // TODO: check if nodes without meshes must be registered
                // use the ancestors parent world matrix to start with, or identity if no parent exists or it's missing a ComponenTransform
                let matrix = FudgeCore.Matrix4x4.IDENTITY;
                if (parent)
                    matrix = parent.mtxWorld;
                // start recursive recalculation of the whole branch starting from the ancestor found
                RenderManager.recalculateTransformsOfNodeAndChildren(ancestor, matrix);
            };
            // call the functions above for each registered node
            // RenderManager.nodes.forEach(markNodeToBeTransformed);
            RenderManager.nodes.forEach(recalculateBranchContainingNode);
        }
        /**
         * Recursive method receiving a childnode and its parents updated world transform.
         * If the childnode owns a ComponentTransform, its worldmatrix is recalculated and passed on to its children, otherwise its parents matrix
         * @param _node
         * @param _world
         */
        static recalculateTransformsOfNodeAndChildren(_node, _world) {
            let world = _world;
            let cmpTransform = _node.cmpTransform;
            if (cmpTransform)
                world = FudgeCore.Matrix4x4.MULTIPLICATION(_world, cmpTransform.local);
            _node.mtxWorld = world;
            _node.timestampUpdate = RenderManager.timestampUpdate;
            for (let child of _node.getChildren()) {
                RenderManager.recalculateTransformsOfNodeAndChildren(child, world);
            }
        }
        // #endregion
        // #region Manage references to render data
        /**
         * Removes a reference to a program, parameter or buffer by decreasing its reference counter and deleting it, if the counter reaches 0
         * @param _in
         * @param _key
         * @param _deletor
         */
        static removeReference(_in, _key, _deletor) {
            let reference;
            reference = _in.get(_key);
            if (reference.decreaseCounter() == 0) {
                // The following deletions may be an optimization, not necessary to start with and maybe counterproductive.
                // If data should be used later again, it must then be reconstructed...
                _deletor(reference.getReference());
                _in.delete(_key);
            }
        }
        /**
         * Increases the counter of the reference to a program, parameter or buffer. Creates the reference, if it's not existent.
         * @param _in
         * @param _key
         * @param _creator
         */
        static createReference(_in, _key, _creator) {
            let reference;
            reference = _in.get(_key);
            if (reference)
                reference.increaseCounter();
            else {
                let content = _creator(_key);
                reference = new Reference(content);
                reference.increaseCounter();
                _in.set(_key, reference);
            }
        }
    }
    /** Stores references to the compiled shader programs and makes them available via the references to shaders */
    RenderManager.renderShaders = new Map();
    /** Stores references to the vertex array objects and makes them available via the references to coats */
    RenderManager.renderCoats = new Map();
    /** Stores references to the vertex buffers and makes them available via the references to meshes */
    RenderManager.renderBuffers = new Map();
    RenderManager.nodes = new Map();
    FudgeCore.RenderManager = RenderManager;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Coat/Coat.ts"/>
var FudgeCore;
/// <reference path="../Coat/Coat.ts"/>
(function (FudgeCore) {
    /**
     * Static superclass for the representation of WebGl shaderprograms.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    // TODO: define attribute/uniforms as layout and use those consistently in shaders
    class Shader {
        /** The type of coat that can be used with this shader to create a material */
        static getCoat() { return null; }
        static getVertexShaderSource() { return null; }
        static getFragmentShaderSource() { return null; }
    }
    FudgeCore.Shader = Shader;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderFlat extends FudgeCore.Shader {
        static getCoat() {
            return FudgeCore.CoatColored;
        }
        static getVertexShaderSource() {
            return `#version 300 es

                    struct LightAmbient {
                        vec4 color;
                    };
                    struct LightDirectional {
                        vec4 color;
                        vec3 direction;
                    };

                    const uint MAX_LIGHTS_DIRECTIONAL = 10u;

                    in vec3 a_position;
                    in vec3 a_normal;
                    uniform mat4 u_world;
                    uniform mat4 u_projection;

                    uniform LightAmbient u_ambient;
                    uniform uint u_nLightsDirectional;
                    uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];
                    flat out vec4 v_color;
                    
                    void main() {   
                        gl_Position = u_projection * vec4(a_position, 1.0);
                        vec3 normal = mat3(u_world) * a_normal;

                        v_color = vec4(0,0,0,0);
                        for (uint i = 0u; i < u_nLightsDirectional; i++) {
                            float illumination = -dot(normal, u_directional[i].direction);
                            if (illumination > 0.0f)
                                v_color += illumination * u_directional[i].color; // vec4(1,1,1,1); // 
                        }
                        //u_ambient;
                        //u_directional[0];
                    }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
                    precision mediump float;

                    uniform vec4 u_color;
                    flat in vec4 v_color;
                    out vec4 frag;
                    
                    void main() {
                        frag = u_color * v_color;
                    }`;
        }
    }
    FudgeCore.ShaderFlat = ShaderFlat;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Matcap (Material Capture) shading. The texture provided by the coat is used as a matcap material.
     * Implementation based on https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader/
     * @authors Simon Storl-Schulke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderMatCap extends FudgeCore.Shader {
        static getCoat() {
            return FudgeCore.CoatMatCap;
        }
        static getVertexShaderSource() {
            return `#version 300 es

                    in vec3 a_position;
                    in vec3 a_normal;
                    uniform mat4 u_projection;

                    out vec2 tex_coords_smooth;
                    flat out vec2 tex_coords_flat;

                    void main() {
                        mat4 normalMatrix = transpose(inverse(u_projection));
                        vec4 p = vec4(a_position, 1.0);
                        vec4 normal4 = vec4(a_normal, 1.0);
                        vec3 e = normalize( vec3( u_projection * p ) );
                        vec3 n = normalize( vec3(normalMatrix * normal4) );

                        vec3 r = reflect( e, n );
                        float m = 2. * sqrt(
                            pow( r.x, 2. ) +
                            pow( r.y, 2. ) +
                            pow( r.z + 1., 2. )
                        );

                        tex_coords_smooth = r.xy / m + .5;
                        tex_coords_flat = r.xy / m + .5;

                        gl_Position = u_projection * vec4(a_position, 1.0);
                    }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
                    precision mediump float;
                    
                    uniform vec4 u_tint_color;
                    uniform float u_flatmix;
                    uniform sampler2D u_texture;
                    
                    in vec2 tex_coords_smooth;
                    flat in vec2 tex_coords_flat;

                    out vec4 frag;

                    void main() {
                        vec2 tc = mix(tex_coords_smooth, tex_coords_flat, u_flatmix);
                        frag = u_tint_color * texture(u_texture, tc) * 2.0;
                    }`;
        }
    }
    FudgeCore.ShaderMatCap = ShaderMatCap;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Renders for Raycasting
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderRayCast extends FudgeCore.Shader {
        static getVertexShaderSource() {
            return `#version 300 es

                    in vec3 a_position;
                    uniform mat4 u_projection;
                    
                    void main() {   
                        gl_Position = u_projection * vec4(a_position, 1.0);
                    }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
                    precision mediump float;
                    precision highp int;
                    
                    uniform int u_id;
                    out vec4 frag;
                    
                    void main() {
                       float id = float(u_id)/ 256.0;
                       float upperbyte = trunc(gl_FragCoord.z * 256.0) / 256.0;
                       float lowerbyte = fract(gl_FragCoord.z * 256.0);
                       frag = vec4(id, id, upperbyte , lowerbyte);
                    }`;
        }
    }
    FudgeCore.ShaderRayCast = ShaderRayCast;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Textured shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderTexture extends FudgeCore.Shader {
        static getCoat() {
            return FudgeCore.CoatTextured;
        }
        static getVertexShaderSource() {
            return `#version 300 es

                in vec3 a_position;
                in vec2 a_textureUVs;
                uniform mat4 u_projection;
                uniform vec4 u_color;
                out vec2 v_textureUVs;

                void main() {  
                    gl_Position = u_projection * vec4(a_position, 1.0);
                    v_textureUVs = a_textureUVs;
                }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
                precision mediump float;
                
                in vec2 v_textureUVs;
                uniform sampler2D u_texture;
                out vec4 frag;
                
                void main() {
                    frag = texture(u_texture, v_textureUVs);
            }`;
        }
    }
    FudgeCore.ShaderTexture = ShaderTexture;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderUniColor extends FudgeCore.Shader {
        static getCoat() {
            return FudgeCore.CoatColored;
        }
        static getVertexShaderSource() {
            return `#version 300 es

                    in vec3 a_position;
                    uniform mat4 u_projection;
                    
                    void main() {   
                        gl_Position = u_projection * vec4(a_position, 1.0);
                    }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
                    precision mediump float;
                    
                    uniform vec4 u_color;
                    out vec4 frag;
                    
                    void main() {
                       frag = u_color;
                    }`;
        }
    }
    FudgeCore.ShaderUniColor = ShaderUniColor;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Baseclass for different kinds of textures.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Texture extends FudgeCore.Mutable {
        reduceMutator() { }
    }
    FudgeCore.Texture = Texture;
    /**
     * Texture created from an existing image
     */
    class TextureImage extends Texture {
        constructor() {
            super(...arguments);
            this.image = null;
        }
    }
    FudgeCore.TextureImage = TextureImage;
    /**
     * Texture created from a canvas
     */
    class TextureCanvas extends Texture {
    }
    FudgeCore.TextureCanvas = TextureCanvas;
    /**
     * Texture created from a FUDGE-Sketch
     */
    class TextureSketch extends TextureCanvas {
    }
    FudgeCore.TextureSketch = TextureSketch;
    /**
     * Texture created from an HTML-page
     */
    class TextureHTML extends TextureCanvas {
    }
    FudgeCore.TextureHTML = TextureHTML;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let TIMER_TYPE;
    (function (TIMER_TYPE) {
        TIMER_TYPE[TIMER_TYPE["INTERVAL"] = 0] = "INTERVAL";
        TIMER_TYPE[TIMER_TYPE["TIMEOUT"] = 1] = "TIMEOUT";
    })(TIMER_TYPE || (TIMER_TYPE = {}));
    class Timer {
        constructor(_time, _type, _callback, _timeout, _arguments) {
            this.type = _type;
            this.timeout = _timeout;
            this.arguments = _arguments;
            this.startTimeReal = performance.now();
            this.callback = _callback;
            let scale = Math.abs(_time.getScale());
            if (!scale) {
                // Time is stopped, timer won't be active
                this.active = false;
                return;
            }
            let id;
            this.timeoutReal = this.timeout / scale;
            if (this.type == TIMER_TYPE.TIMEOUT) {
                let callback = () => {
                    _time.deleteTimerByInternalId(this.id);
                    _callback(_arguments);
                };
                id = window.setTimeout(callback, this.timeoutReal);
            }
            else
                id = window.setInterval(_callback, this.timeoutReal, _arguments);
            this.id = id;
            this.active = true;
        }
        clear() {
            if (this.type == TIMER_TYPE.TIMEOUT) {
                if (this.active)
                    // save remaining time to timeout as new timeout for restart
                    this.timeout = this.timeout * (1 - (performance.now() - this.startTimeReal) / this.timeoutReal);
                window.clearTimeout(this.id);
            }
            else
                // TODO: reusing timer starts interval anew. Should be remaining interval as timeout, then starting interval anew 
                window.clearInterval(this.id);
            this.active = false;
        }
    }
    /**
     * Instances of this class generate a timestamp that correlates with the time elapsed since the start of the program but allows for resetting and scaling.
     * Supports interval- and timeout-callbacks identical with standard Javascript but with respect to the scaled time
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Time extends EventTarget {
        constructor() {
            super();
            this.timers = {};
            this.idTimerNext = 0;
            this.start = performance.now();
            this.scale = 1.0;
            this.offset = 0.0;
            this.lastCallToElapsed = 0.0;
        }
        /**
         * Returns the game-time-object which starts automatically and serves as base for various internal operations.
         */
        static get game() {
            return Time.gameTime;
        }
        /**
         * Retrieves the current scaled timestamp of this instance in milliseconds
         */
        get() {
            return this.offset + this.scale * (performance.now() - this.start);
        }
        /**
         * (Re-) Sets the timestamp of this instance
         * @param _time The timestamp to represent the current time (default 0.0)
         */
        set(_time = 0) {
            this.offset = _time;
            this.start = performance.now();
            this.getElapsedSincePreviousCall();
        }
        /**
         * Sets the scaling of this time, allowing for slowmotion (<1) or fastforward (>1)
         * @param _scale The desired scaling (default 1.0)
         */
        setScale(_scale = 1.0) {
            this.set(this.get());
            this.scale = _scale;
            //TODO: catch scale=0
            this.rescaleAllTimers();
            this.getElapsedSincePreviousCall();
            this.dispatchEvent(new Event("timeScaled" /* TIME_SCALED */));
        }
        /**
         * Retrieves the current scaling of this time
         */
        getScale() {
            return this.scale;
        }
        /**
         * Retrieves the offset of this time
         */
        getOffset() {
            return this.offset;
        }
        /**
         * Retrieves the scaled time in milliseconds passed since the last call to this method
         * Automatically reset at every call to set(...) and setScale(...)
         */
        getElapsedSincePreviousCall() {
            let current = this.get();
            let elapsed = current - this.lastCallToElapsed;
            this.lastCallToElapsed = current;
            return elapsed;
        }
        //#region Timers
        // TODO: examine if web-workers would enhance performance here!
        /**
         * See Javascript documentation. Creates an internal [[Timer]] object
         * @param _callback
         * @param _timeout
         * @param _arguments
         */
        setTimeout(_callback, _timeout, ..._arguments) {
            return this.setTimer(TIMER_TYPE.TIMEOUT, _callback, _timeout, _arguments);
        }
        /**
         * See Javascript documentation. Creates an internal [[Timer]] object
         * @param _callback
         * @param _timeout
         * @param _arguments
         */
        setInterval(_callback, _timeout, ..._arguments) {
            return this.setTimer(TIMER_TYPE.INTERVAL, _callback, _timeout, _arguments);
        }
        /**
         * See Javascript documentation
         * @param _id
         */
        clearTimeout(_id) {
            this.deleteTimer(_id);
        }
        /**
         * See Javascript documentation
         * @param _id
         */
        clearInterval(_id) {
            this.deleteTimer(_id);
        }
        /**
         * Stops and deletes all [[Timer]]s attached. Should be called before this Time-object leaves scope
         */
        clearAllTimers() {
            for (let id in this.timers) {
                this.deleteTimer(Number(id));
            }
        }
        /**
         * Recreates [[Timer]]s when scaling changes
         */
        rescaleAllTimers() {
            for (let id in this.timers) {
                let timer = this.timers[id];
                timer.clear();
                if (!this.scale)
                    // Time has stopped, no need to replace cleared timers
                    continue;
                let timeout = timer.timeout;
                // if (timer.type == TIMER_TYPE.TIMEOUT && timer.active)
                //     // for an active timeout-timer, calculate the remaining time to timeout
                //     timeout = (performance.now() - timer.startTimeReal) / timer.timeoutReal;
                let replace = new Timer(this, timer.type, timer.callback, timeout, timer.arguments);
                this.timers[id] = replace;
            }
        }
        /**
         * Deletes [[Timer]] found using the id of the connected interval/timeout-object
         * @param _id
         */
        deleteTimerByInternalId(_id) {
            for (let id in this.timers) {
                let timer = this.timers[id];
                if (timer.id == _id) {
                    timer.clear();
                    delete this.timers[id];
                }
            }
        }
        setTimer(_type, _callback, _timeout, _arguments) {
            let timer = new Timer(this, _type, _callback, _timeout, _arguments);
            this.timers[++this.idTimerNext] = timer;
            return this.idTimerNext;
        }
        deleteTimer(_id) {
            this.timers[_id].clear();
            delete this.timers[_id];
        }
    }
    Time.gameTime = new Time();
    FudgeCore.Time = Time;
})(FudgeCore || (FudgeCore = {}));
///<reference path="../Event/Event.ts"/>
///<reference path="../Time/Time.ts"/>
var FudgeCore;
///<reference path="../Event/Event.ts"/>
///<reference path="../Time/Time.ts"/>
(function (FudgeCore) {
    let LOOP_MODE;
    (function (LOOP_MODE) {
        /** Loop cycles controlled by window.requestAnimationFrame */
        LOOP_MODE["FRAME_REQUEST"] = "frameRequest";
        /** Loop cycles with the given framerate in [[Time]].game */
        LOOP_MODE["TIME_GAME"] = "timeGame";
        /** Loop cycles with the given framerate in realtime, independent of [[Time]].game */
        LOOP_MODE["TIME_REAL"] = "timeReal";
    })(LOOP_MODE = FudgeCore.LOOP_MODE || (FudgeCore.LOOP_MODE = {}));
    /**
     * Core loop of a Fudge application. Initializes automatically and must be started explicitly.
     * It then fires [[EVENT]].LOOP\_FRAME to all added listeners at each frame
     */
    class Loop extends FudgeCore.EventTargetStatic {
        /**
         * Starts the loop with the given mode and fps
         * @param _mode
         * @param _fps Is only applicable in TIME-modes
         * @param _syncWithAnimationFrame Experimental and only applicable in TIME-modes. Should defer the loop-cycle until the next possible animation frame.
         */
        static start(_mode = LOOP_MODE.FRAME_REQUEST, _fps = 60, _syncWithAnimationFrame = false) {
            Loop.stop();
            Loop.timeStartGame = FudgeCore.Time.game.get();
            Loop.timeStartReal = performance.now();
            Loop.timeLastFrameGame = Loop.timeStartGame;
            Loop.timeLastFrameReal = Loop.timeStartReal;
            Loop.fpsDesired = (_mode == LOOP_MODE.FRAME_REQUEST) ? 60 : _fps;
            Loop.framesToAverage = Loop.fpsDesired;
            Loop.timeLastFrameGameAvg = Loop.timeLastFrameRealAvg = 1000 / Loop.fpsDesired;
            Loop.mode = _mode;
            Loop.syncWithAnimationFrame = _syncWithAnimationFrame;
            let log = `Loop starting in mode ${Loop.mode}`;
            if (Loop.mode != LOOP_MODE.FRAME_REQUEST)
                log += ` with attempted ${_fps} fps`;
            FudgeCore.Debug.log(log);
            switch (_mode) {
                case LOOP_MODE.FRAME_REQUEST:
                    Loop.loopFrame();
                    break;
                case LOOP_MODE.TIME_REAL:
                    Loop.idIntervall = window.setInterval(Loop.loopTime, 1000 / Loop.fpsDesired);
                    Loop.loopTime();
                    break;
                case LOOP_MODE.TIME_GAME:
                    Loop.idIntervall = FudgeCore.Time.game.setInterval(Loop.loopTime, 1000 / Loop.fpsDesired);
                    Loop.loopTime();
                    break;
                default:
                    break;
            }
            Loop.running = true;
        }
        /**
         * Stops the loop
         */
        static stop() {
            if (!Loop.running)
                return;
            switch (Loop.mode) {
                case LOOP_MODE.FRAME_REQUEST:
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                case LOOP_MODE.TIME_REAL:
                    window.clearInterval(Loop.idIntervall);
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                case LOOP_MODE.TIME_GAME:
                    // TODO: DANGER! id changes internally in game when time is scaled!
                    FudgeCore.Time.game.clearInterval(Loop.idIntervall);
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                default:
                    break;
            }
            FudgeCore.Debug.log("Loop stopped!");
        }
        static getFpsGameAverage() {
            return 1000 / Loop.timeLastFrameGameAvg;
        }
        static getFpsRealAverage() {
            return 1000 / Loop.timeLastFrameRealAvg;
        }
        static loop() {
            let time;
            time = performance.now();
            Loop.timeFrameReal = time - Loop.timeLastFrameReal;
            Loop.timeLastFrameReal = time;
            time = FudgeCore.Time.game.get();
            Loop.timeFrameGame = time - Loop.timeLastFrameGame;
            Loop.timeLastFrameGame = time;
            Loop.timeLastFrameGameAvg = ((Loop.framesToAverage - 1) * Loop.timeLastFrameGameAvg + Loop.timeFrameGame) / Loop.framesToAverage;
            Loop.timeLastFrameRealAvg = ((Loop.framesToAverage - 1) * Loop.timeLastFrameRealAvg + Loop.timeFrameReal) / Loop.framesToAverage;
            let event = new Event("loopFrame" /* LOOP_FRAME */);
            Loop.targetStatic.dispatchEvent(event);
        }
        static loopFrame() {
            Loop.loop();
            Loop.idRequest = window.requestAnimationFrame(Loop.loopFrame);
        }
        static loopTime() {
            if (Loop.syncWithAnimationFrame)
                Loop.idRequest = window.requestAnimationFrame(Loop.loop);
            else
                Loop.loop();
        }
    }
    /** The gametime the loop was started, overwritten at each start */
    Loop.timeStartGame = 0;
    /** The realtime the loop was started, overwritten at each start */
    Loop.timeStartReal = 0;
    /** The gametime elapsed since the last loop cycle */
    Loop.timeFrameGame = 0;
    /** The realtime elapsed since the last loop cycle */
    Loop.timeFrameReal = 0;
    Loop.timeLastFrameGame = 0;
    Loop.timeLastFrameReal = 0;
    Loop.timeLastFrameGameAvg = 0;
    Loop.timeLastFrameRealAvg = 0;
    Loop.running = false;
    Loop.mode = LOOP_MODE.FRAME_REQUEST;
    Loop.idIntervall = 0;
    Loop.idRequest = 0;
    Loop.fpsDesired = 30;
    Loop.framesToAverage = 30;
    Loop.syncWithAnimationFrame = false;
    FudgeCore.Loop = Loop;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Handles file transfer from a Fudge-Browserapp to the local filesystem without a local server.
     * Saves to the download-path given by the browser, loads from the player's choice.
     */
    class FileIoBrowserLocal extends FudgeCore.EventTargetStatic {
        // TODO: refactor to async function to be handled using promise, instead of using event target
        static load() {
            FileIoBrowserLocal.selector = document.createElement("input");
            FileIoBrowserLocal.selector.type = "file";
            FileIoBrowserLocal.selector.multiple = true;
            FileIoBrowserLocal.selector.hidden = true;
            FileIoBrowserLocal.selector.addEventListener("change", FileIoBrowserLocal.handleFileSelect);
            document.body.appendChild(FileIoBrowserLocal.selector);
            FileIoBrowserLocal.selector.click();
        }
        // TODO: refactor to async function to be handled using promise, instead of using event target
        static save(_toSave) {
            for (let filename in _toSave) {
                let content = _toSave[filename];
                let blob = new Blob([content], { type: "text/plain" });
                let url = window.URL.createObjectURL(blob);
                //*/ using anchor element for download
                let downloader;
                downloader = document.createElement("a");
                downloader.setAttribute("href", url);
                downloader.setAttribute("download", filename);
                document.body.appendChild(downloader);
                downloader.click();
                document.body.removeChild(downloader);
                window.URL.revokeObjectURL(url);
            }
            let event = new CustomEvent("fileSaved" /* FILE_SAVED */, { detail: { mapFilenameToContent: _toSave } });
            FileIoBrowserLocal.targetStatic.dispatchEvent(event);
        }
        static async handleFileSelect(_event) {
            console.log("-------------------------------- handleFileSelect");
            document.body.removeChild(FileIoBrowserLocal.selector);
            let fileList = _event.target.files;
            console.log(fileList, fileList.length);
            if (fileList.length == 0)
                return;
            let loaded = {};
            await FileIoBrowserLocal.loadFiles(fileList, loaded);
            let event = new CustomEvent("fileLoaded" /* FILE_LOADED */, { detail: { mapFilenameToContent: loaded } });
            FileIoBrowserLocal.targetStatic.dispatchEvent(event);
        }
        static async loadFiles(_fileList, _loaded) {
            for (let file of _fileList) {
                const content = await new Response(file).text();
                _loaded[file.name] = content;
            }
        }
    }
    FudgeCore.FileIoBrowserLocal = FileIoBrowserLocal;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVkZ2VDb3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vU291cmNlL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHMiLCIuLi9Tb3VyY2UvVHJhbnNmZXIvTXV0YWJsZS50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uLnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25GdW5jdGlvbi50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uS2V5LnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25TZXF1ZW5jZS50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpby50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0ZpbHRlci50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0xpc3RlbmVyLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvTG9jYWxpc2F0aW9uLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvU2Vzc2lvbkRhdGEudHMiLCIuLi9Tb3VyY2UvQXVkaW8vQXVkaW9TZXR0aW5ncy50cyIsIi4uL1NvdXJjZS9SZW5kZXIvUmVuZGVySW5qZWN0b3IudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck9wZXJhdG9yLnRzIiwiLi4vU291cmNlL0NvYXQvQ29hdC50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50LnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRBbmltYXRvci50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50QXVkaW8udHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudEF1ZGlvTGlzdGVuZXIudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudENhbWVyYS50cyIsIi4uL1NvdXJjZS9MaWdodC9MaWdodC50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50TGlnaHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudE1hdGVyaWFsLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRNZXNoLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRTY3JpcHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudFRyYW5zZm9ybS50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0ludGVyZmFjZXMudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUYXJnZXQudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdBbGVydC50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0NvbnNvbGUudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWcudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdEaWFsb2cudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUZXh0QXJlYS50cyIsIi4uL1NvdXJjZS9FbmdpbmUvQ29sb3IudHMiLCIuLi9Tb3VyY2UvRW5naW5lL01hdGVyaWFsLnRzIiwiLi4vU291cmNlL0VuZ2luZS9SZWN5Y2xlci50cyIsIi4uL1NvdXJjZS9FbmdpbmUvUmVzb3VyY2VNYW5hZ2VyLnRzIiwiLi4vU291cmNlL0VuZ2luZS9WaWV3cG9ydC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudEtleWJvYXJkLnRzIiwiLi4vU291cmNlL01hdGgvRnJhbWluZy50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDN4My50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDR4NC50cyIsIi4uL1NvdXJjZS9NYXRoL1JlY3RhbmdsZS50cyIsIi4uL1NvdXJjZS9NYXRoL1ZlY3RvcjIudHMiLCIuLi9Tb3VyY2UvTWF0aC9WZWN0b3IzLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaC50cyIsIi4uL1NvdXJjZS9NZXNoL01lc2hDdWJlLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaFB5cmFtaWQudHMiLCIuLi9Tb3VyY2UvTWVzaC9NZXNoUXVhZC50cyIsIi4uL1NvdXJjZS9Ob2RlL05vZGUudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2UudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2VJbnN0YW5jZS50cyIsIi4uL1NvdXJjZS9SYXkvUmF5LnRzIiwiLi4vU291cmNlL1JheS9SYXlIaXQudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck1hbmFnZXIudHMiLCIuLi9Tb3VyY2UvU2hhZGVyL1NoYWRlci50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyRmxhdC50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyTWF0Q2FwLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJSYXlDYXN0LnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJUZXh0dXJlLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJVbmlDb2xvci50cyIsIi4uL1NvdXJjZS9UZXh0dXJlL1RleHR1cmUudHMiLCIuLi9Tb3VyY2UvVGltZS9UaW1lLnRzIiwiLi4vU291cmNlL1RpbWUvTG9vcC50cyIsIi4uL1NvdXJjZS9UcmFuc2Zlci9GaWxlSW9Ccm93c2VyTG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLElBQVUsU0FBUyxDQXVMbEI7QUF2TEQsV0FBVSxTQUFTO0lBZ0JmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0EyQkc7SUFDSCxNQUFzQixVQUFVO1FBSTVCOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFrQjtZQUM5QyxLQUFLLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxVQUFVO2dCQUNsQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVTtvQkFDekMsT0FBTztZQUVmLElBQUksSUFBSSxHQUFXLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxJQUFJO2dCQUNMLEtBQUssSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtvQkFD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RUQ7Ozs7V0FJRztRQUNILFNBQVM7WUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDZixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEMsT0FBTzthQUNSO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0IsT0FBTzthQUNSO1lBRUQsSUFBSSxFQUFFLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFFcEQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMxQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBRTdCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxL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TSxLQUFLLE1BQU07WUFDcEIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ00sTUFBTSxLQUFLLElBQUk7WUFDbEIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ00sTUFBTSxLQUFLLE9BQU87WUFDckIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRU0sV0FBVyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVU7WUFDN0QsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFTSxZQUFZLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVTtZQUM5RCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxF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R0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNy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QUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDYjtnQkFDRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRzthQUM5QyxDQUFDLENBQUM7WUFDTCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFrQjtZQUN4QyxJQUFJLENBQUMsR0FBaUIsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNuQyxJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUU5QixJQUFJLEVBQUUsR0FBVyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO2dCQUNyRCxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFekMsSUFBSSxFQUFFLEdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztnQkFDckQsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLElBQUksRUFBRSxHQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7Z0JBQ3RELENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLEVBQUUsR0FBVyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUN0RCxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFMUMsSUFBSSxDQUFDLEdBQVcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRWxFLHlDQUF5QztZQUN6QyxNQUFNLE1BQU0sR0FBYyxVQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDckYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDckYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDdkYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDdkYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMs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Q0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDL0QsT0FBTztnQkFDUCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdEUsY0FBYztnQkFDZCxRQUFRO2dCQUNSLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDL0QsT0FBTztnQkFDUCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN6RSxDQUFDLENBQUM7WUFFSCw0Q0FBNEM7WUFDNUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFOUMsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQztRQUVT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QUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkQsSUFBSSxRQUFRLEdBQWdDLE1BQU0sQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDO1lBQ2pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFDcEIsT0FBTztZQUVYLElBQUksTUFBTSxHQUF5QixFQUFFLENBQUM7WUFDdEMsTUFBTSxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXJELElBQUksS0FBSyxHQUFnQixJQUFJLFdBQVcsaUNBQW9CLEVBQUUsTUFBTSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFHLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVNLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1CLEVBQUUsT0FBNkI7WUFDNUUsS0FBSyxJQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7Z0JBQ3hCLE1BQU0sT0FBTyxHQUFXLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO2FBQ2hDO1FBQ0wsQ0FBQztLQUNKO0lBdkRZLDRCQUFrQixxQkF1RDlCLENBQUE7QUFDTCxDQUFDLEVBaEVTLFNBQVMsS0FBVCxTQUFTLFFBZ0VsQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1hbnlcclxuICAgIGV4cG9ydCB0eXBlIEdlbmVyYWwgPSBhbnk7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICBbdHlwZTogc3RyaW5nXTogR2VuZXJhbDtcclxuICAgIH1cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXphYmxlIHtcclxuICAgICAgICBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbjtcclxuICAgICAgICBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgTmFtZXNwYWNlUmVnaXN0ZXIge1xyXG4gICAgICAgIFtuYW1lOiBzdHJpbmddOiBPYmplY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIHRoZSBleHRlcm5hbCBzZXJpYWxpemF0aW9uIGFuZCBkZXNlcmlhbGl6YXRpb24gb2YgW1tTZXJpYWxpemFibGVdXSBvYmplY3RzLiBUaGUgaW50ZXJuYWwgcHJvY2VzcyBpcyBoYW5kbGVkIGJ5IHRoZSBvYmplY3RzIHRoZW1zZWx2ZXMuICBcclxuICAgICAqIEEgW1tTZXJpYWxpemF0aW9uXV0gb2JqZWN0IGNhbiBiZSBjcmVhdGVkIGZyb20gYSBbW1NlcmlhbGl6YWJsZV1dIG9iamVjdCBhbmQgYSBKU09OLVN0cmluZyBtYXkgYmUgY3JlYXRlZCBmcm9tIHRoYXQuICBcclxuICAgICAqIFZpY2UgdmVyc2EsIGEgSlNPTi1TdHJpbmcgY2FuIGJlIHBhcnNlZCB0byBhIFtbU2VyaWFsaXphdGlvbl1dIHdoaWNoIGNhbiBiZSBkZXNlcmlhbGl6ZWQgdG8gYSBbW1NlcmlhbGl6YWJsZV1dIG9iamVjdC5cclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICogIFtTZXJpYWxpemFibGVdIOKGkiAoc2VyaWFsaXplKSDihpIgW1NlcmlhbGl6YXRpb25dIOKGkiAoc3RyaW5naWZ5KSAgXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4oaTXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbU3RyaW5nXVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKGk1xyXG4gICAgICogIFtTZXJpYWxpemFibGVdIOKGkCAoZGVzZXJpYWxpemUpIOKGkCBbU2VyaWFsaXphdGlvbl0g4oaQIChwYXJzZSlcclxuICAgICAqIGBgYCAgICAgIFxyXG4gICAgICogV2hpbGUgdGhlIGludGVybmFsIHNlcmlhbGl6ZS9kZXNlcmlhbGl6ZSBtZXRob2RzIG9mIHRoZSBvYmplY3RzIGNhcmUgb2YgdGhlIHNlbGVjdGlvbiBvZiBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gcmVjcmVhdGUgdGhlIG9iamVjdCBhbmQgaXRzIHN0cnVjdHVyZSwgIFxyXG4gICAgICogdGhlIFtbU2VyaWFsaXplcl1dIGtlZXBzIHRyYWNrIG9mIHRoZSBuYW1lc3BhY2VzIGFuZCBjbGFzc2VzIGluIG9yZGVyIHRvIHJlY3JlYXRlIFtbU2VyaWFsaXphYmxlXV0gb2JqZWN0cy4gVGhlIGdlbmVyYWwgc3RydWN0dXJlIG9mIGEgW1tTZXJpYWxpemF0aW9uXV0gaXMgYXMgZm9sbG93cyAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqIHtcclxuICAgICAqICAgICAgbmFtZXNwYWNlTmFtZS5jbGFzc05hbWU6IHtcclxuICAgICAqICAgICAgICAgIHByb3BlcnR5TmFtZTogcHJvcGVydHlWYWx1ZSxcclxuICAgICAqICAgICAgICAgIC4uLixcclxuICAgICAqICAgICAgICAgIHByb3BlcnR5TmFtZU9mUmVmZXJlbmNlOiBTZXJpYWxpemF0aW9uT2ZUaGVSZWZlcmVuY2VkT2JqZWN0LFxyXG4gICAgICogICAgICAgICAgLi4uLFxyXG4gICAgICogICAgICAgICAgY29uc3RydWN0b3JOYW1lT2ZTdXBlcmNsYXNzOiBTZXJpYWxpemF0aW9uT2ZTdXBlckNsYXNzXHJcbiAgICAgKiAgICAgIH1cclxuICAgICAqIH1cclxuICAgICAqIGBgYFxyXG4gICAgICogU2luY2UgdGhlIGluc3RhbmNlIG9mIHRoZSBzdXBlcmNsYXNzIGlzIGNyZWF0ZWQgYXV0b21hdGljYWxseSB3aGVuIGFuIG9iamVjdCBpcyBjcmVhdGVkLCBcclxuICAgICAqIHRoZSBTZXJpYWxpemF0aW9uT2ZTdXBlckNsYXNzIG9taXRzIHRoZSB0aGUgbmFtZXNwYWNlTmFtZS5jbGFzc05hbWUga2V5IGFuZCBjb25zaXN0cyBvbmx5IG9mIGl0cyB2YWx1ZS4gXHJcbiAgICAgKiBUaGUgY29uc3RydWN0b3JOYW1lT2ZTdXBlcmNsYXNzIGlzIGdpdmVuIGluc3RlYWQgYXMgYSBwcm9wZXJ0eSBuYW1lIGluIHRoZSBzZXJpYWxpemF0aW9uIG9mIHRoZSBzdWJjbGFzcy5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNlcmlhbGl6ZXIge1xyXG4gICAgICAgIC8qKiBJbiBvcmRlciBmb3IgdGhlIFNlcmlhbGl6ZXIgdG8gY3JlYXRlIGNsYXNzIGluc3RhbmNlcywgaXQgbmVlZHMgYWNjZXNzIHRvIHRoZSBhcHByb3ByaWF0ZSBuYW1lc3BhY2VzICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgbmFtZXNwYWNlczogTmFtZXNwYWNlUmVnaXN0ZXIgPSB7IFwixpJcIjogRnVkZ2VDb3JlIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVycyBhIG5hbWVzcGFjZSB0byB0aGUgW1tTZXJpYWxpemVyXV0sIHRvIGVuYWJsZSBhdXRvbWF0aWMgaW5zdGFudGlhdGlvbiBvZiBjbGFzc2VzIGRlZmluZWQgd2l0aGluXHJcbiAgICAgICAgICogQHBhcmFtIF9uYW1lc3BhY2UgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZWdpc3Rlck5hbWVzcGFjZShfbmFtZXNwYWNlOiBPYmplY3QpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBTZXJpYWxpemVyLm5hbWVzcGFjZXMpXHJcbiAgICAgICAgICAgICAgICBpZiAoU2VyaWFsaXplci5uYW1lc3BhY2VzW25hbWVdID09IF9uYW1lc3BhY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9IFNlcmlhbGl6ZXIuZmluZE5hbWVzcGFjZUluKF9uYW1lc3BhY2UsIHdpbmRvdyk7XHJcbiAgICAgICAgICAgIGlmICghbmFtZSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcmVudE5hbWUgaW4gU2VyaWFsaXplci5uYW1lc3BhY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFNlcmlhbGl6ZXIuZmluZE5hbWVzcGFjZUluKF9uYW1lc3BhY2UsIFNlcmlhbGl6ZXIubmFtZXNwYWNlc1twYXJlbnROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHBhcmVudE5hbWUgKyBcIi5cIiArIG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmFtZSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5hbWVzcGFjZSBub3QgZm91bmQuIE1heWJlIHBhcmVudCBuYW1lc3BhY2UgaGFzbid0IGJlZW4gcmVnaXN0ZXJlZCBiZWZvcmU/XCIpO1xyXG5cclxuICAgICAgICAgICAgU2VyaWFsaXplci5uYW1lc3BhY2VzW25hbWVdID0gX25hbWVzcGFjZTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGEgamF2YXNjcmlwdCBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzZXJpYWxpemFibGUgRlVER0Utb2JqZWN0IGdpdmVuLFxyXG4gICAgICAgICAqIGluY2x1ZGluZyBhdHRhY2hlZCBjb21wb25lbnRzLCBjaGlsZHJlbiwgc3VwZXJjbGFzcy1vYmplY3RzIGFsbCBpbmZvcm1hdGlvbiBuZWVkZWQgZm9yIHJlY29uc3RydWN0aW9uXHJcbiAgICAgICAgICogQHBhcmFtIF9vYmplY3QgQW4gb2JqZWN0IHRvIHNlcmlhbGl6ZSwgaW1wbGVtZW50aW5nIHRoZSBbW1NlcmlhbGl6YWJsZV1dIGludGVyZmFjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2VyaWFsaXplKF9vYmplY3Q6IFNlcmlhbGl6YWJsZSk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHt9O1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBzYXZlIHRoZSBuYW1lc3BhY2Ugd2l0aCB0aGUgY29uc3RydWN0b3JzIG5hbWVcclxuICAgICAgICAgICAgLy8gc2VyaWFsaXphdGlvbltfb2JqZWN0LmNvbnN0cnVjdG9yLm5hbWVdID0gX29iamVjdC5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IHRoaXMuZ2V0RnVsbFBhdGgoX29iamVjdCk7XHJcbiAgICAgICAgICAgIGlmICghcGF0aClcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTmFtZXNwYWNlIG9mIHNlcmlhbGl6YWJsZSBvYmplY3Qgb2YgdHlwZSAke19vYmplY3QuY29uc3RydWN0b3IubmFtZX0gbm90IGZvdW5kLiBNYXliZSB0aGUgbmFtZXNwYWNlIGhhc24ndCBiZWVuIHJlZ2lzdGVyZWQgb3IgdGhlIGNsYXNzIG5vdCBleHBvcnRlZD9gKTtcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbltwYXRoXSA9IF9vYmplY3Quc2VyaWFsaXplKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgICAgICAvLyByZXR1cm4gX29iamVjdC5zZXJpYWxpemUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYSBGVURHRS1vYmplY3QgcmVjb25zdHJ1Y3RlZCBmcm9tIHRoZSBpbmZvcm1hdGlvbiBpbiB0aGUgW1tTZXJpYWxpemF0aW9uXV0gZ2l2ZW4sXHJcbiAgICAgICAgICogaW5jbHVkaW5nIGF0dGFjaGVkIGNvbXBvbmVudHMsIGNoaWxkcmVuLCBzdXBlcmNsYXNzLW9iamVjdHNcclxuICAgICAgICAgKiBAcGFyYW0gX3NlcmlhbGl6YXRpb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIGxldCByZWNvbnN0cnVjdDogU2VyaWFsaXphYmxlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgLy8gbG9vcCBjb25zdHJ1Y3RlZCBzb2xlbHkgdG8gYWNjZXNzIHR5cGUtcHJvcGVydHkuIE9ubHkgb25lIGV4cGVjdGVkIVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGF0aCBpbiBfc2VyaWFsaXphdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlY29uc3RydWN0ID0gbmV3ICg8R2VuZXJhbD5GdWRnZSlbdHlwZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlY29uc3RydWN0ID0gU2VyaWFsaXplci5yZWNvbnN0cnVjdChwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICByZWNvbnN0cnVjdC5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltwYXRoXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY29uc3RydWN0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEZXNlcmlhbGl6YXRpb24gZmFpbGVkOiBcIiArIG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9UT0RPOiBpbXBsZW1lbnQgcHJldHRpZmllciB0byBtYWtlIEpTT04tU3RyaW5naWZpY2F0aW9uIG9mIHNlcmlhbGl6YXRpb25zIG1vcmUgcmVhZGFibGUsIGUuZy4gcGxhY2luZyB4LCB5IGFuZCB6IGluIG9uZSBsaW5lXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBwcmV0dGlmeShfanNvbjogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIF9qc29uOyB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYSBmb3JtYXR0ZWQsIGh1bWFuIHJlYWRhYmxlIEpTT04tU3RyaW5nLCByZXByZXNlbnRpbmcgdGhlIGdpdmVuIFtbU2VyaWFsaXphaW9uXV0gdGhhdCBtYXkgaGF2ZSBiZWVuIGNyZWF0ZWQgYnkgW1tTZXJpYWxpemVyXV0uc2VyaWFsaXplXHJcbiAgICAgICAgICogQHBhcmFtIF9zZXJpYWxpemF0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmdpZnkoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBzdHJpbmcge1xyXG4gICAgICAgICAgICAvLyBhZGp1c3RtZW50cyB0byBzZXJpYWxpemF0aW9uIGNhbiBiZSBtYWRlIGhlcmUgYmVmb3JlIHN0cmluZ2lmaWNhdGlvbiwgaWYgZGVzaXJlZFxyXG4gICAgICAgICAgICBsZXQganNvbjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoX3NlcmlhbGl6YXRpb24sIG51bGwsIDIpO1xyXG4gICAgICAgICAgICBsZXQgcHJldHR5OiBzdHJpbmcgPSBTZXJpYWxpemVyLnByZXR0aWZ5KGpzb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gcHJldHR5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIFtbU2VyaWFsaXphdGlvbl1dIGNyZWF0ZWQgZnJvbSB0aGUgZ2l2ZW4gSlNPTi1TdHJpbmcuIFJlc3VsdCBtYXkgYmUgcGFzc2VkIHRvIFtbU2VyaWFsaXplcl1dLmRlc2VyaWFsaXplXHJcbiAgICAgICAgICogQHBhcmFtIF9qc29uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcGFyc2UoX2pzb246IHN0cmluZyk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShfanNvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gb2JqZWN0IG9mIHRoZSBjbGFzcyBkZWZpbmVkIHdpdGggdGhlIGZ1bGwgcGF0aCBpbmNsdWRpbmcgdGhlIG5hbWVzcGFjZU5hbWUocykgYW5kIHRoZSBjbGFzc05hbWUgc2VwZXJhdGVkIGJ5IGRvdHMoLikgXHJcbiAgICAgICAgICogQHBhcmFtIF9wYXRoIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlY29uc3RydWN0KF9wYXRoOiBzdHJpbmcpOiBTZXJpYWxpemFibGUge1xyXG4gICAgICAgICAgICBsZXQgdHlwZU5hbWU6IHN0cmluZyA9IF9wYXRoLnN1YnN0cihfcGF0aC5sYXN0SW5kZXhPZihcIi5cIikgKyAxKTtcclxuICAgICAgICAgICAgbGV0IG5hbWVzcGFjZTogT2JqZWN0ID0gU2VyaWFsaXplci5nZXROYW1lc3BhY2UoX3BhdGgpO1xyXG4gICAgICAgICAgICBpZiAoIW5hbWVzcGFjZSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTmFtZXNwYWNlIG9mIHNlcmlhbGl6YWJsZSBvYmplY3Qgb2YgdHlwZSAke3R5cGVOYW1lfSBub3QgZm91bmQuIE1heWJlIHRoZSBuYW1lc3BhY2UgaGFzbid0IGJlZW4gcmVnaXN0ZXJlZD9gKTtcclxuICAgICAgICAgICAgbGV0IHJlY29uc3RydWN0aW9uOiBTZXJpYWxpemFibGUgPSBuZXcgKDxHZW5lcmFsPm5hbWVzcGFjZSlbdHlwZU5hbWVdO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVjb25zdHJ1Y3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBmdWxsIHBhdGggdG8gdGhlIGNsYXNzIG9mIHRoZSBvYmplY3QsIGlmIGZvdW5kIGluIHRoZSByZWdpc3RlcmVkIG5hbWVzcGFjZXNcclxuICAgICAgICAgKiBAcGFyYW0gX29iamVjdCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBnZXRGdWxsUGF0aChfb2JqZWN0OiBTZXJpYWxpemFibGUpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgdHlwZU5hbWU6IHN0cmluZyA9IF9vYmplY3QuY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgLy8gRGVidWcubG9nKFwiU2VhcmNoaW5nIG5hbWVzcGFjZSBvZjogXCIgKyB0eXBlTmFtZSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWVzcGFjZU5hbWUgaW4gU2VyaWFsaXplci5uYW1lc3BhY2VzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm91bmQ6IEdlbmVyYWwgPSAoPEdlbmVyYWw+U2VyaWFsaXplci5uYW1lc3BhY2VzKVtuYW1lc3BhY2VOYW1lXVt0eXBlTmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoZm91bmQgJiYgX29iamVjdCBpbnN0YW5jZW9mIGZvdW5kKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuYW1lc3BhY2VOYW1lICsgXCIuXCIgKyB0eXBlTmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIG5hbWVzcGFjZS1vYmplY3QgZGVmaW5lZCB3aXRoaW4gdGhlIGZ1bGwgcGF0aCwgaWYgcmVnaXN0ZXJlZFxyXG4gICAgICAgICAqIEBwYXJhbSBfcGF0aFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGdldE5hbWVzcGFjZShfcGF0aDogc3RyaW5nKTogT2JqZWN0IHtcclxuICAgICAgICAgICAgbGV0IG5hbWVzcGFjZU5hbWU6IHN0cmluZyA9IF9wYXRoLnN1YnN0cigwLCBfcGF0aC5sYXN0SW5kZXhPZihcIi5cIikpO1xyXG4gICAgICAgICAgICByZXR1cm4gU2VyaWFsaXplci5uYW1lc3BhY2VzW25hbWVzcGFjZU5hbWVdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmluZHMgdGhlIG5hbWVzcGFjZS1vYmplY3QgaW4gcHJvcGVydGllcyBvZiB0aGUgcGFyZW50LW9iamVjdCAoZS5nLiB3aW5kb3cpLCBpZiBwcmVzZW50XHJcbiAgICAgICAgICogQHBhcmFtIF9uYW1lc3BhY2UgXHJcbiAgICAgICAgICogQHBhcmFtIF9wYXJlbnQgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZmluZE5hbWVzcGFjZUluKF9uYW1lc3BhY2U6IE9iamVjdCwgX3BhcmVudDogT2JqZWN0KTogc3RyaW5nIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcHJvcCBpbiBfcGFyZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKCg8R2VuZXJhbD5fcGFyZW50KVtwcm9wXSA9PSBfbmFtZXNwYWNlKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9wO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIGRhdGF0eXBlcyBvZiB0aGUgYXR0cmlidXRlcyBhIG11dGF0b3IgYXMgc3RyaW5ncyBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNdXRhdG9yQXR0cmlidXRlVHlwZXMge1xyXG4gICAgICAgIFthdHRyaWJ1dGU6IHN0cmluZ106IHN0cmluZyB8IE9iamVjdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBtdXRhdG9yLCB3aGljaCBpcyBhbiBhc3NvY2lhdGl2ZSBhcnJheSB3aXRoIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgdmFsdWVzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTXV0YXRvciB7XHJcbiAgICAgICAgW2F0dHJpYnV0ZTogc3RyaW5nXTogT2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJbnRlcmZhY2VzIGRlZGljYXRlZCBmb3IgZWFjaCBwdXJwb3NlLiBFeHRyYSBhdHRyaWJ1dGUgbmVjZXNzYXJ5IGZvciBjb21waWxldGltZSB0eXBlIGNoZWNraW5nLCBub3QgZXhpc3RlbnQgYXQgcnVudGltZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE11dGF0b3JGb3JBbmltYXRpb24gZXh0ZW5kcyBNdXRhdG9yIHsgcmVhZG9ubHkgZm9yQW5pbWF0aW9uOiBudWxsOyB9XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE11dGF0b3JGb3JVc2VySW50ZXJmYWNlIGV4dGVuZHMgTXV0YXRvciB7IHJlYWRvbmx5IGZvclVzZXJJbnRlcmZhY2U6IG51bGw7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJhc2UgY2xhc3MgZm9yIGFsbCB0eXBlcyBiZWluZyBtdXRhYmxlIHVzaW5nIFtbTXV0YXRvcl1dLW9iamVjdHMsIHRodXMgcHJvdmlkaW5nIGFuZCB1c2luZyBpbnRlcmZhY2VzIGNyZWF0ZWQgYXQgcnVudGltZS4gIFxyXG4gICAgICogTXV0YWJsZXMgcHJvdmlkZSBhIFtbTXV0YXRvcl1dIHRoYXQgaXMgYnVpbGQgYnkgY29sbGVjdGluZyBhbGwgb2JqZWN0LXByb3BlcnRpZXMgdGhhdCBhcmUgZWl0aGVyIG9mIGEgcHJpbWl0aXZlIHR5cGUgb3IgYWdhaW4gTXV0YWJsZS5cclxuICAgICAqIFN1YmNsYXNzZXMgY2FuIGVpdGhlciByZWR1Y2UgdGhlIHN0YW5kYXJkIFtbTXV0YXRvcl1dIGJ1aWx0IGJ5IHRoaXMgYmFzZSBjbGFzcyBieSBkZWxldGluZyBwcm9wZXJ0aWVzIG9yIGltcGxlbWVudCBhbiBpbmRpdmlkdWFsIGdldE11dGF0b3ItbWV0aG9kLlxyXG4gICAgICogVGhlIHByb3ZpZGVkIHByb3BlcnRpZXMgb2YgdGhlIFtbTXV0YXRvcl1dIG11c3QgbWF0Y2ggcHVibGljIHByb3BlcnRpZXMgb3IgZ2V0dGVycy9zZXR0ZXJzIG9mIHRoZSBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2UsIHRoZXkgd2lsbCBiZSBpZ25vcmVkIGlmIG5vdCBoYW5kbGVkIGJ5IGFuIG92ZXJyaWRlIG9mIHRoZSBtdXRhdGUtbWV0aG9kIGluIHRoZSBzdWJjbGFzcyBhbmQgdGhyb3cgZXJyb3JzIGluIGFuIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIHVzZXItaW50ZXJmYWNlIGZvciB0aGUgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgTXV0YWJsZSBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIHR5cGUgb2YgdGhpcyBtdXRhYmxlIHN1YmNsYXNzIGFzIHRoZSBuYW1lIG9mIHRoZSBydW50aW1lIGNsYXNzXHJcbiAgICAgICAgICogQHJldHVybnMgVGhlIHR5cGUgb2YgdGhlIG11dGFibGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0IHR5cGUoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29sbGVjdCBhcHBsaWNhYmxlIGF0dHJpYnV0ZXMgb2YgdGhlIGluc3RhbmNlIGFuZCBjb3BpZXMgb2YgdGhlaXIgdmFsdWVzIGluIGEgTXV0YXRvci1vYmplY3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNvbGxlY3QgcHJpbWl0aXZlIGFuZCBtdXRhYmxlIGF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIHRoaXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTogT2JqZWN0ID0gdGhpc1thdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIE11dGFibGUpKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgbXV0YXRvclthdHRyaWJ1dGVdID0gdGhpc1thdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBtdXRhdG9yIGNhbiBiZSByZWR1Y2VkIGJ1dCBub3QgZXh0ZW5kZWQhXHJcbiAgICAgICAgICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhtdXRhdG9yKTtcclxuICAgICAgICAgICAgLy8gZGVsZXRlIHVud2FudGVkIGF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgdGhpcy5yZWR1Y2VNdXRhdG9yKG11dGF0b3IpO1xyXG5cclxuICAgICAgICAgICAgLy8gcmVwbGFjZSByZWZlcmVuY2VzIHRvIG11dGFibGUgb2JqZWN0cyB3aXRoIHJlZmVyZW5jZXMgdG8gY29waWVzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGF0dHJpYnV0ZSBpbiBtdXRhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWU6IE9iamVjdCA9IG11dGF0b3JbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE11dGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvclthdHRyaWJ1dGVdID0gdmFsdWUuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbXV0YXRvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbGxlY3QgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIGluc3RhbmNlIGFuZCB0aGVpciB2YWx1ZXMgYXBwbGljYWJsZSBmb3IgYW5pbWF0aW9uLlxyXG4gICAgICAgICAqIEJhc2ljIGZ1bmN0aW9uYWxpdHkgaXMgaWRlbnRpY2FsIHRvIFtbZ2V0TXV0YXRvcl1dLCByZXR1cm5lZCBtdXRhdG9yIHNob3VsZCB0aGVuIGJlIHJlZHVjZWQgYnkgdGhlIHN1YmNsYXNzZWQgaW5zdGFuY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvckZvckFuaW1hdGlvbigpOiBNdXRhdG9yRm9yQW5pbWF0aW9uIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxNdXRhdG9yRm9yQW5pbWF0aW9uPnRoaXMuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb2xsZWN0IHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBpbnN0YW5jZSBhbmQgdGhlaXIgdmFsdWVzIGFwcGxpY2FibGUgZm9yIHRoZSB1c2VyIGludGVyZmFjZS5cclxuICAgICAgICAgKiBCYXNpYyBmdW5jdGlvbmFsaXR5IGlzIGlkZW50aWNhbCB0byBbW2dldE11dGF0b3JdXSwgcmV0dXJuZWQgbXV0YXRvciBzaG91bGQgdGhlbiBiZSByZWR1Y2VkIGJ5IHRoZSBzdWJjbGFzc2VkIGluc3RhbmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3JGb3JVc2VySW50ZXJmYWNlKCk6IE11dGF0b3JGb3JVc2VySW50ZXJmYWNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxNdXRhdG9yRm9yVXNlckludGVyZmFjZT50aGlzLmdldE11dGF0b3IoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhbiBhc3NvY2lhdGl2ZSBhcnJheSB3aXRoIHRoZSBzYW1lIGF0dHJpYnV0ZXMgYXMgdGhlIGdpdmVuIG11dGF0b3IsIGJ1dCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIHR5cGVzIGFzIHN0cmluZy12YWx1ZXNcclxuICAgICAgICAgKiBEb2VzIG5vdCByZWN1cnNlIGludG8gb2JqZWN0cyFcclxuICAgICAgICAgKiBAcGFyYW0gX211dGF0b3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcjogTXV0YXRvcik6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyB7XHJcbiAgICAgICAgICAgIGxldCB0eXBlczogTXV0YXRvckF0dHJpYnV0ZVR5cGVzID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGF0dHJpYnV0ZSBpbiBfbXV0YXRvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHR5cGU6IHN0cmluZyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWU6IG51bWJlciB8IGJvb2xlYW4gfCBzdHJpbmcgfCBvYmplY3QgPSBfbXV0YXRvclthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKF9tdXRhdG9yW2F0dHJpYnV0ZV0gIT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKHZhbHVlKSA9PSBcIm9iamVjdFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlID0gKDxHZW5lcmFsPnRoaXMpW2F0dHJpYnV0ZV0uY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSBfbXV0YXRvclthdHRyaWJ1dGVdLmNvbnN0cnVjdG9yLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB0eXBlc1thdHRyaWJ1dGVdID0gdHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHlwZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIHZhbHVlcyBvZiB0aGUgZ2l2ZW4gbXV0YXRvciBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGluc3RhbmNlXHJcbiAgICAgICAgICogQHBhcmFtIF9tdXRhdG9yIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB1cGRhdGVNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGF0dHJpYnV0ZSBpbiBfbXV0YXRvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBPYmplY3QgPSBfbXV0YXRvclthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTXV0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmdldE11dGF0b3IoKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBfbXV0YXRvclthdHRyaWJ1dGVdID0gKDxHZW5lcmFsPnRoaXMpW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgYXR0cmlidXRlIHZhbHVlcyBvZiB0aGUgaW5zdGFuY2UgYWNjb3JkaW5nIHRvIHRoZSBzdGF0ZSBvZiB0aGUgbXV0YXRvci4gTXVzdCBiZSBwcm90ZWN0ZWQuLi4hXHJcbiAgICAgICAgICogQHBhcmFtIF9tdXRhdG9yXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIG11dGF0ZShfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBkb24ndCBhc3NpZ24gdW5rbm93biBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGF0dHJpYnV0ZSBpbiBfbXV0YXRvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBNdXRhdG9yID0gPE11dGF0b3I+X211dGF0b3JbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgICAgIGxldCBtdXRhbnQ6IE9iamVjdCA9ICg8R2VuZXJhbD50aGlzKVthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKG11dGFudCBpbnN0YW5jZW9mIE11dGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YW50Lm11dGF0ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgKDxHZW5lcmFsPnRoaXMpW2F0dHJpYnV0ZV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULk1VVEFURSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWR1Y2VzIHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBnZW5lcmFsIG11dGF0b3IgYWNjb3JkaW5nIHRvIGRlc2lyZWQgb3B0aW9ucyBmb3IgbXV0YXRpb24uIFRvIGJlIGltcGxlbWVudGVkIGluIHN1YmNsYXNzZXNcclxuICAgICAgICAgKiBAcGFyYW0gX211dGF0b3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9TZXJpYWxpemVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIC8qKlxyXG4gICAqIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBBbmltYXRpb25TdHJ1Y3R1cmUgdGhhdCB0aGUgQW5pbWF0aW9uIHVzZXMgdG8gbWFwIHRoZSBTZXF1ZW5jZXMgdG8gdGhlIEF0dHJpYnV0ZXMuXHJcbiAgICogQnVpbHQgb3V0IG9mIGEgW1tOb2RlXV0ncyBzZXJpYWxzYXRpb24sIGl0IHN3YXBzIHRoZSB2YWx1ZXMgd2l0aCBbW0FuaW1hdGlvblNlcXVlbmNlXV1zLlxyXG4gICAqL1xyXG4gIGV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3RydWN0dXJlIHtcclxuICAgIFthdHRyaWJ1dGU6IHN0cmluZ106IFNlcmlhbGl6YXRpb24gfCBBbmltYXRpb25TZXF1ZW5jZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogQW4gYXNzb2NpYXRpdmUgYXJyYXkgbWFwcGluZyBuYW1lcyBvZiBsYWJsZXMgdG8gdGltZXN0YW1wcy5cclxuICAqIExhYmVscyBuZWVkIHRvIGJlIHVuaXF1ZSBwZXIgQW5pbWF0aW9uLlxyXG4gICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICovXHJcbiAgZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25MYWJlbCB7XHJcbiAgICBbbmFtZTogc3RyaW5nXTogbnVtYmVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBIb2xkcyBpbmZvcm1hdGlvbiBhYm91dCBBbmltYXRpb24gRXZlbnQgVHJpZ2dlcnNcclxuICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAqL1xyXG4gIGV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgIFtuYW1lOiBzdHJpbmddOiBudW1iZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcm5hbGx5IHVzZWQgdG8gZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIHRoZSB2YXJpb3VzIGdlbmVyYXRlZCBzdHJ1Y3R1cmVzIGFuZCBldmVudHMuXHJcbiAgICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGVudW0gQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFIHtcclxuICAgIC8qKkRlZmF1bHQ6IGZvcndhcmQsIGNvbnRpbm91cyAqL1xyXG4gICAgTk9STUFMLFxyXG4gICAgLyoqYmFja3dhcmQsIGNvbnRpbm91cyAqL1xyXG4gICAgUkVWRVJTRSxcclxuICAgIC8qKmZvcndhcmQsIHJhc3RlcmVkICovXHJcbiAgICBSQVNURVJFRCxcclxuICAgIC8qKmJhY2t3YXJkLCByYXN0ZXJlZCAqL1xyXG4gICAgUkFTVEVSRURSRVZFUlNFXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRpb24gQ2xhc3MgdG8gaG9sZCBhbGwgcmVxdWlyZWQgT2JqZWN0cyB0aGF0IGFyZSBwYXJ0IG9mIGFuIEFuaW1hdGlvbi5cclxuICAgKiBBbHNvIGhvbGRzIGZ1bmN0aW9ucyB0byBwbGF5IHNhaWQgQW5pbWF0aW9uLlxyXG4gICAqIENhbiBiZSBhZGRlZCB0byBhIE5vZGUgYW5kIHBsYXllZCB0aHJvdWdoIFtbQ29tcG9uZW50QW5pbWF0b3JdXS5cclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiBleHRlbmRzIE11dGFibGUgaW1wbGVtZW50cyBTZXJpYWxpemFibGVSZXNvdXJjZSB7XHJcbiAgICBpZFJlc291cmNlOiBzdHJpbmc7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICB0b3RhbFRpbWU6IG51bWJlciA9IDA7XHJcbiAgICBsYWJlbHM6IEFuaW1hdGlvbkxhYmVsID0ge307XHJcbiAgICBzdGVwc1BlclNlY29uZDogbnVtYmVyID0gMTA7XHJcbiAgICBhbmltYXRpb25TdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZTtcclxuICAgIGV2ZW50czogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0ge307XHJcbiAgICBwcml2YXRlIGZyYW1lc1BlclNlY29uZDogbnVtYmVyID0gNjA7XHJcblxyXG4gICAgLy8gcHJvY2Vzc2VkIGV2ZW50bGlzdCBhbmQgYW5pbWF0aW9uIHN0cnVjdXRyZXMgZm9yIHBsYXliYWNrLlxyXG4gICAgcHJpdmF0ZSBldmVudHNQcm9jZXNzZWQ6IE1hcDxBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUsIEFuaW1hdGlvbkV2ZW50VHJpZ2dlcj4gPSBuZXcgTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyPigpO1xyXG4gICAgcHJpdmF0ZSBhbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkOiBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25TdHJ1Y3R1cmU+ID0gbmV3IE1hcDxBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUsIEFuaW1hdGlvblN0cnVjdHVyZT4oKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfbmFtZTogc3RyaW5nLCBfYW5pbVN0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlID0ge30sIF9mcHM6IG51bWJlciA9IDYwKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMubmFtZSA9IF9uYW1lO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSA9IF9hbmltU3RydWN0dXJlO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQuc2V0KEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5OT1JNQUwsIF9hbmltU3RydWN0dXJlKTtcclxuICAgICAgdGhpcy5mcmFtZXNQZXJTZWNvbmQgPSBfZnBzO1xyXG4gICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsVGltZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGVzIGEgbmV3IFwiTXV0YXRvclwiIHdpdGggdGhlIGluZm9ybWF0aW9uIHRvIGFwcGx5IHRvIHRoZSBbW05vZGVdXSB0aGUgW1tDb21wb25lbnRBbmltYXRvcl1dIGlzIGF0dGFjaGVkIHRvIHdpdGggW1tOb2RlLmFwcGx5QW5pbWF0aW9uKCldXS5cclxuICAgICAqIEBwYXJhbSBfdGltZSBUaGUgdGltZSBhdCB3aGljaCB0aGUgYW5pbWF0aW9uIGN1cnJlbnRseSBpcyBhdFxyXG4gICAgICogQHBhcmFtIF9kaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiBpbiB3aGljaCB0aGUgYW5pbWF0aW9uIGlzIHN1cHBvc2VkIHRvIGJlIHBsYXlpbmcgYmFjay4gPjAgPT0gZm9yd2FyZCwgMCA9PSBzdG9wLCA8MCA9PSBiYWNrd2FyZHNcclxuICAgICAqIEBwYXJhbSBfcGxheWJhY2sgVGhlIHBsYXliYWNrbW9kZSB0aGUgYW5pbWF0aW9uIGlzIHN1cHBvc2VkIHRvIGJlIGNhbGN1bGF0ZWQgd2l0aC5cclxuICAgICAqIEByZXR1cm5zIGEgXCJNdXRhdG9yXCIgdG8gYXBwbHkuXHJcbiAgICAgKi9cclxuICAgIGdldE11dGF0ZWQoX3RpbWU6IG51bWJlciwgX2RpcmVjdGlvbjogbnVtYmVyLCBfcGxheWJhY2s6IEFOSU1BVElPTl9QTEFZQkFDSyk6IE11dGF0b3IgeyAgICAgLy9UT0RPOiBmaW5kIGEgYmV0dGVyIG5hbWUgZm9yIHRoaXNcclxuICAgICAgbGV0IG06IE11dGF0b3IgPSB7fTtcclxuICAgICAgaWYgKF9wbGF5YmFjayA9PSBBTklNQVRJT05fUExBWUJBQ0suVElNRUJBU0VEX0NPTlRJTk9VUykge1xyXG4gICAgICAgIGlmIChfZGlyZWN0aW9uID49IDApIHtcclxuICAgICAgICAgIG0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcih0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuTk9STUFMKSwgX3RpbWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck11dGF0b3IodGhpcy5nZXRQcm9jZXNzZWRBbmltYXRpb25TdHJ1Y3R1cmUoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0UpLCBfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChfZGlyZWN0aW9uID49IDApIHtcclxuICAgICAgICAgIG0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcih0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRUQpLCBfdGltZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcih0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRURSRVZFUlNFKSwgX3RpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIG07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbGlzdCBvZiB0aGUgbmFtZXMgb2YgdGhlIGV2ZW50cyB0aGUgW1tDb21wb25lbnRBbmltYXRvcl1dIG5lZWRzIHRvIGZpcmUgYmV0d2VlbiBfbWluIGFuZCBfbWF4LiBcclxuICAgICAqIEBwYXJhbSBfbWluIFRoZSBtaW5pbXVtIHRpbWUgKGluY2x1c2l2ZSkgdG8gY2hlY2sgYmV0d2VlblxyXG4gICAgICogQHBhcmFtIF9tYXggVGhlIG1heGltdW0gdGltZSAoZXhjbHVzaXZlKSB0byBjaGVjayBiZXR3ZWVuXHJcbiAgICAgKiBAcGFyYW0gX3BsYXliYWNrIFRoZSBwbGF5YmFjayBtb2RlIHRvIGNoZWNrIGluLiBIYXMgYW4gZWZmZWN0IG9uIHdoZW4gdGhlIEV2ZW50cyBhcmUgZmlyZWQuIFxyXG4gICAgICogQHBhcmFtIF9kaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiB0aGUgYW5pbWF0aW9uIGlzIHN1cHBvc2VkIHRvIHJ1biBpbi4gPjAgPT0gZm9yd2FyZCwgMCA9PSBzdG9wLCA8MCA9PSBiYWNrd2FyZHNcclxuICAgICAqIEByZXR1cm5zIGEgbGlzdCBvZiBzdHJpbmdzIHdpdGggdGhlIG5hbWVzIG9mIHRoZSBjdXN0b20gZXZlbnRzIHRvIGZpcmUuXHJcbiAgICAgKi9cclxuICAgIGdldEV2ZW50c1RvRmlyZShfbWluOiBudW1iZXIsIF9tYXg6IG51bWJlciwgX3BsYXliYWNrOiBBTklNQVRJT05fUExBWUJBQ0ssIF9kaXJlY3Rpb246IG51bWJlcik6IHN0cmluZ1tdIHtcclxuICAgICAgbGV0IGV2ZW50TGlzdDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgbGV0IG1pblNlY3Rpb246IG51bWJlciA9IE1hdGguZmxvb3IoX21pbiAvIHRoaXMudG90YWxUaW1lKTtcclxuICAgICAgbGV0IG1heFNlY3Rpb246IG51bWJlciA9IE1hdGguZmxvb3IoX21heCAvIHRoaXMudG90YWxUaW1lKTtcclxuICAgICAgX21pbiA9IF9taW4gJSB0aGlzLnRvdGFsVGltZTtcclxuICAgICAgX21heCA9IF9tYXggJSB0aGlzLnRvdGFsVGltZTtcclxuXHJcbiAgICAgIHdoaWxlIChtaW5TZWN0aW9uIDw9IG1heFNlY3Rpb24pIHtcclxuICAgICAgICBsZXQgZXZlbnRUcmlnZ2VyczogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0gdGhpcy5nZXRDb3JyZWN0RXZlbnRMaXN0KF9kaXJlY3Rpb24sIF9wbGF5YmFjayk7XHJcbiAgICAgICAgaWYgKG1pblNlY3Rpb24gPT0gbWF4U2VjdGlvbikge1xyXG4gICAgICAgICAgZXZlbnRMaXN0ID0gZXZlbnRMaXN0LmNvbmNhdCh0aGlzLmNoZWNrRXZlbnRzQmV0d2VlbihldmVudFRyaWdnZXJzLCBfbWluLCBfbWF4KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGV2ZW50TGlzdCA9IGV2ZW50TGlzdC5jb25jYXQodGhpcy5jaGVja0V2ZW50c0JldHdlZW4oZXZlbnRUcmlnZ2VycywgX21pbiwgdGhpcy50b3RhbFRpbWUpKTtcclxuICAgICAgICAgIF9taW4gPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtaW5TZWN0aW9uKys7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBldmVudExpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGFuIEV2ZW50IHRvIHRoZSBMaXN0IG9mIGV2ZW50cy5cclxuICAgICAqIEBwYXJhbSBfbmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgKG5lZWRzIHRvIGJlIHVuaXF1ZSBwZXIgQW5pbWF0aW9uKS5cclxuICAgICAqIEBwYXJhbSBfdGltZSBUaGUgdGltZXN0YW1wIG9mIHRoZSBldmVudCAoaW4gbWlsbGlzZWNvbmRzKS5cclxuICAgICAqL1xyXG4gICAgc2V0RXZlbnQoX25hbWU6IHN0cmluZywgX3RpbWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLmV2ZW50c1tfbmFtZV0gPSBfdGltZTtcclxuICAgICAgdGhpcy5ldmVudHNQcm9jZXNzZWQuY2xlYXIoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIHRoZSBldmVudCB3aXRoIHRoZSBnaXZlbiBuYW1lIGZyb20gdGhlIGxpc3Qgb2YgZXZlbnRzLlxyXG4gICAgICogQHBhcmFtIF9uYW1lIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRXZlbnQoX25hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICBkZWxldGUgdGhpcy5ldmVudHNbX25hbWVdO1xyXG4gICAgICB0aGlzLmV2ZW50c1Byb2Nlc3NlZC5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBnZXRMYWJlbHMoKTogRW51bWVyYXRvciB7XHJcbiAgICAgIC8vVE9ETzogdGhpcyBhY3R1YWxseSBuZWVkcyB0ZXN0aW5nXHJcbiAgICAgIGxldCBlbjogRW51bWVyYXRvciA9IG5ldyBFbnVtZXJhdG9yKHRoaXMubGFiZWxzKTtcclxuICAgICAgcmV0dXJuIGVuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBmcHMoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZnJhbWVzUGVyU2Vjb25kO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBmcHMoX2ZwczogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gX2ZwcztcclxuICAgICAgdGhpcy5ldmVudHNQcm9jZXNzZWQuY2xlYXIoKTtcclxuICAgICAgdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAoUmUtKUNhbGN1bGF0ZSB0aGUgdG90YWwgdGltZSBvZiB0aGUgQW5pbWF0aW9uLiBDYWxjdWxhdGlvbi1oZWF2eSwgdXNlIG9ubHkgaWYgYWN0dWFsbHkgbmVlZGVkLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVUb3RhbFRpbWUoKTogdm9pZCB7XHJcbiAgICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuICAgICAgdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvclRpbWUodGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI3JlZ2lvbiB0cmFuc2ZlclxyXG4gICAgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICBsZXQgczogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICBpZFJlc291cmNlOiB0aGlzLmlkUmVzb3VyY2UsXHJcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgIGxhYmVsczoge30sXHJcbiAgICAgICAgZXZlbnRzOiB7fSxcclxuICAgICAgICBmcHM6IHRoaXMuZnJhbWVzUGVyU2Vjb25kLFxyXG4gICAgICAgIHNwczogdGhpcy5zdGVwc1BlclNlY29uZFxyXG4gICAgICB9O1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMubGFiZWxzKSB7XHJcbiAgICAgICAgcy5sYWJlbHNbbmFtZV0gPSB0aGlzLmxhYmVsc1tuYW1lXTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMuZXZlbnRzKSB7XHJcbiAgICAgICAgcy5ldmVudHNbbmFtZV0gPSB0aGlzLmV2ZW50c1tuYW1lXTtcclxuICAgICAgfVxyXG4gICAgICBzLmFuaW1hdGlvblN0cnVjdHVyZSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JTZXJpYWxpc2F0aW9uKHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlKTtcclxuICAgICAgcmV0dXJuIHM7XHJcbiAgICB9XHJcbiAgICBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIHRoaXMuaWRSZXNvdXJjZSA9IF9zZXJpYWxpemF0aW9uLmlkUmVzb3VyY2U7XHJcbiAgICAgIHRoaXMubmFtZSA9IF9zZXJpYWxpemF0aW9uLm5hbWU7XHJcbiAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gX3NlcmlhbGl6YXRpb24uZnBzO1xyXG4gICAgICB0aGlzLnN0ZXBzUGVyU2Vjb25kID0gX3NlcmlhbGl6YXRpb24uc3BzO1xyXG4gICAgICB0aGlzLmxhYmVscyA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIF9zZXJpYWxpemF0aW9uLmxhYmVscykge1xyXG4gICAgICAgIHRoaXMubGFiZWxzW25hbWVdID0gX3NlcmlhbGl6YXRpb24ubGFiZWxzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZXZlbnRzID0ge307XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gX3NlcmlhbGl6YXRpb24uZXZlbnRzKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBfc2VyaWFsaXphdGlvbi5ldmVudHNbbmFtZV07XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5ldmVudHNQcm9jZXNzZWQgPSBuZXcgTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyPigpO1xyXG5cclxuICAgICAgdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUgPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yRGVzZXJpYWxpc2F0aW9uKF9zZXJpYWxpemF0aW9uLmFuaW1hdGlvblN0cnVjdHVyZSk7XHJcblxyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQgPSBuZXcgTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uU3RydWN0dXJlPigpO1xyXG5cclxuICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFRpbWUoKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2VyaWFsaXplKCk7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICBkZWxldGUgX211dGF0b3IudG90YWxUaW1lO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmF2ZXJzZXMgYW4gQW5pbWF0aW9uU3RydWN0dXJlIGFuZCByZXR1cm5zIHRoZSBTZXJpYWxpemF0aW9uIG9mIHNhaWQgU3RydWN0dXJlLlxyXG4gICAgICogQHBhcmFtIF9zdHJ1Y3R1cmUgVGhlIEFuaW1hdGlvbiBTdHJ1Y3R1cmUgYXQgdGhlIGN1cnJlbnQgbGV2ZWwgdG8gdHJhbnNmb3JtIGludG8gdGhlIFNlcmlhbGl6YXRpb24uXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgZmlsbGVkIFNlcmlhbGl6YXRpb24uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdHJhdmVyc2VTdHJ1Y3R1cmVGb3JTZXJpYWxpc2F0aW9uKF9zdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICBsZXQgbmV3U2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9zdHJ1Y3R1cmUpIHtcclxuICAgICAgICBpZiAoX3N0cnVjdHVyZVtuXSBpbnN0YW5jZW9mIEFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBuZXdTZXJpYWxpemF0aW9uW25dID0gX3N0cnVjdHVyZVtuXS5zZXJpYWxpemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmV3U2VyaWFsaXphdGlvbltuXSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JTZXJpYWxpc2F0aW9uKDxBbmltYXRpb25TdHJ1Y3R1cmU+X3N0cnVjdHVyZVtuXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXdTZXJpYWxpemF0aW9uO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmF2ZXJzZXMgYSBTZXJpYWxpemF0aW9uIHRvIGNyZWF0ZSBhIG5ldyBBbmltYXRpb25TdHJ1Y3R1cmUuXHJcbiAgICAgKiBAcGFyYW0gX3NlcmlhbGl6YXRpb24gVGhlIHNlcmlhbGl6YXRpb24gdG8gdHJhbnNmZXIgaW50byBhbiBBbmltYXRpb25TdHJ1Y3R1cmVcclxuICAgICAqIEByZXR1cm5zIHRoZSBuZXdseSBjcmVhdGVkIEFuaW1hdGlvblN0cnVjdHVyZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0cmF2ZXJzZVN0cnVjdHVyZUZvckRlc2VyaWFsaXNhdGlvbihfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IEFuaW1hdGlvblN0cnVjdHVyZSB7XHJcbiAgICAgIGxldCBuZXdTdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9zZXJpYWxpemF0aW9uKSB7XHJcbiAgICAgICAgaWYgKF9zZXJpYWxpemF0aW9uW25dLmFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBsZXQgYW5pbVNlcTogQW5pbWF0aW9uU2VxdWVuY2UgPSBuZXcgQW5pbWF0aW9uU2VxdWVuY2UoKTtcclxuICAgICAgICAgIG5ld1N0cnVjdHVyZVtuXSA9IGFuaW1TZXEuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb25bbl0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBuZXdTdHJ1Y3R1cmVbbl0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yRGVzZXJpYWxpc2F0aW9uKF9zZXJpYWxpemF0aW9uW25dKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ld1N0cnVjdHVyZTtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZHMgdGhlIGxpc3Qgb2YgZXZlbnRzIHRvIGJlIHVzZWQgd2l0aCB0aGVzZSBzZXR0aW5ncy5cclxuICAgICAqIEBwYXJhbSBfZGlyZWN0aW9uIFRoZSBkaXJlY3Rpb24gdGhlIGFuaW1hdGlvbiBpcyBwbGF5aW5nIGluLlxyXG4gICAgICogQHBhcmFtIF9wbGF5YmFjayBUaGUgcGxheWJhY2ttb2RlIHRoZSBhbmltYXRpb24gaXMgcGxheWluZyBpbi5cclxuICAgICAqIEByZXR1cm5zIFRoZSBjb3JyZWN0IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciBPYmplY3QgdG8gdXNlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0Q29ycmVjdEV2ZW50TGlzdChfZGlyZWN0aW9uOiBudW1iZXIsIF9wbGF5YmFjazogQU5JTUFUSU9OX1BMQVlCQUNLKTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgICAgaWYgKF9wbGF5YmFjayAhPSBBTklNQVRJT05fUExBWUJBQ0suRlJBTUVCQVNFRCkge1xyXG4gICAgICAgIGlmIChfZGlyZWN0aW9uID49IDApIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuTk9STUFMKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKF9kaXJlY3Rpb24gPj0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRURSRVZFUlNFKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYXZlcnNlcyBhbiBBbmltYXRpb25TdHJ1Y3R1cmUgdG8gdHVybiBpdCBpbnRvIHRoZSBcIk11dGF0b3JcIiB0byByZXR1cm4gdG8gdGhlIENvbXBvbmVudC5cclxuICAgICAqIEBwYXJhbSBfc3RydWN0dXJlIFRoZSBzdHJjdXR1cmUgdG8gdHJhdmVyc2VcclxuICAgICAqIEBwYXJhbSBfdGltZSB0aGUgcG9pbnQgaW4gdGltZSB0byB3cml0ZSB0aGUgYW5pbWF0aW9uIG51bWJlcnMgaW50by5cclxuICAgICAqIEByZXR1cm5zIFRoZSBcIk11dGF0b3JcIiBmaWxsZWQgd2l0aCB0aGUgY29ycmVjdCB2YWx1ZXMgYXQgdGhlIGdpdmVuIHRpbWUuIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcihfc3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUsIF90aW1lOiBudW1iZXIpOiBNdXRhdG9yIHtcclxuICAgICAgbGV0IG5ld011dGF0b3I6IE11dGF0b3IgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbiBpbiBfc3RydWN0dXJlKSB7XHJcbiAgICAgICAgaWYgKF9zdHJ1Y3R1cmVbbl0gaW5zdGFuY2VvZiBBbmltYXRpb25TZXF1ZW5jZSkge1xyXG4gICAgICAgICAgbmV3TXV0YXRvcltuXSA9ICg8QW5pbWF0aW9uU2VxdWVuY2U+X3N0cnVjdHVyZVtuXSkuZXZhbHVhdGUoX3RpbWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBuZXdNdXRhdG9yW25dID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck11dGF0b3IoPEFuaW1hdGlvblN0cnVjdHVyZT5fc3RydWN0dXJlW25dLCBfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXdNdXRhdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhdmVyc2VzIHRoZSBjdXJyZW50IEFuaW1hdGlvblN0cmN1dHVyZSB0byBmaW5kIHRoZSB0b3RhbFRpbWUgb2YgdGhpcyBhbmltYXRpb24uXHJcbiAgICAgKiBAcGFyYW0gX3N0cnVjdHVyZSBUaGUgc3RydWN0dXJlIHRvIHRyYXZlcnNlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdHJhdmVyc2VTdHJ1Y3R1cmVGb3JUaW1lKF9zdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSk6IHZvaWQge1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9zdHJ1Y3R1cmUpIHtcclxuICAgICAgICBpZiAoX3N0cnVjdHVyZVtuXSBpbnN0YW5jZW9mIEFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBsZXQgc2VxdWVuY2U6IEFuaW1hdGlvblNlcXVlbmNlID0gPEFuaW1hdGlvblNlcXVlbmNlPl9zdHJ1Y3R1cmVbbl07XHJcbiAgICAgICAgICBpZiAoc2VxdWVuY2UubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgc2VxdWVuY2VUaW1lOiBudW1iZXIgPSBzZXF1ZW5jZS5nZXRLZXkoc2VxdWVuY2UubGVuZ3RoIC0gMSkuVGltZTtcclxuICAgICAgICAgICAgdGhpcy50b3RhbFRpbWUgPSBzZXF1ZW5jZVRpbWUgPiB0aGlzLnRvdGFsVGltZSA/IHNlcXVlbmNlVGltZSA6IHRoaXMudG90YWxUaW1lO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yVGltZSg8QW5pbWF0aW9uU3RydWN0dXJlPl9zdHJ1Y3R1cmVbbl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5zdXJlcyB0aGUgZXhpc3RhbmNlIG9mIHRoZSByZXF1ZXN0ZWQgW1tBbmltYXRpb25TdHJjdXR1cmVdXSBhbmQgcmV0dXJucyBpdC5cclxuICAgICAqIEBwYXJhbSBfdHlwZSB0aGUgdHlwZSBvZiB0aGUgc3RydWN0dXJlIHRvIGdldFxyXG4gICAgICogQHJldHVybnMgdGhlIHJlcXVlc3RlZCBbW0FuaW1hdGlvblN0cnVjdHVyZV1dXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKF90eXBlOiBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUpOiBBbmltYXRpb25TdHJ1Y3R1cmUge1xyXG4gICAgICBpZiAoIXRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZC5oYXMoX3R5cGUpKSB7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFRpbWUoKTtcclxuICAgICAgICBsZXQgYWU6IEFuaW1hdGlvblN0cnVjdHVyZSA9IHt9O1xyXG4gICAgICAgIHN3aXRjaCAoX3R5cGUpIHtcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLk5PUk1BTDpcclxuICAgICAgICAgICAgYWUgPSB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFOlxyXG4gICAgICAgICAgICBhZSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JOZXdTdHJ1Y3R1cmUodGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUsIHRoaXMuY2FsY3VsYXRlUmV2ZXJzZVNlcXVlbmNlLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEOlxyXG4gICAgICAgICAgICBhZSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JOZXdTdHJ1Y3R1cmUodGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUsIHRoaXMuY2FsY3VsYXRlUmFzdGVyZWRTZXF1ZW5jZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRFJFVkVSU0U6XHJcbiAgICAgICAgICAgIGFlID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZSh0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkVWRVJTRSksIHRoaXMuY2FsY3VsYXRlUmFzdGVyZWRTZXF1ZW5jZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZC5zZXQoX3R5cGUsIGFlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkLmdldChfdHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbnN1cmVzIHRoZSBleGlzdGFuY2Ugb2YgdGhlIHJlcXVlc3RlZCBbW0FuaW1hdGlvbkV2ZW50VHJpZ2dlcl1dIGFuZCByZXR1cm5zIGl0LlxyXG4gICAgICogQHBhcmFtIF90eXBlIFRoZSB0eXBlIG9mIEFuaW1hdGlvbkV2ZW50VHJpZ2dlciB0byBnZXRcclxuICAgICAqIEByZXR1cm5zIHRoZSByZXF1ZXN0ZWQgW1tBbmltYXRpb25FdmVudFRyaWdnZXJdXVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihfdHlwZTogQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFKTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgICAgaWYgKCF0aGlzLmV2ZW50c1Byb2Nlc3NlZC5oYXMoX3R5cGUpKSB7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFRpbWUoKTtcclxuICAgICAgICBsZXQgZXY6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciA9IHt9O1xyXG4gICAgICAgIHN3aXRjaCAoX3R5cGUpIHtcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLk5PUk1BTDpcclxuICAgICAgICAgICAgZXYgPSB0aGlzLmV2ZW50cztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFOlxyXG4gICAgICAgICAgICBldiA9IHRoaXMuY2FsY3VsYXRlUmV2ZXJzZUV2ZW50VHJpZ2dlcnModGhpcy5ldmVudHMpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEOlxyXG4gICAgICAgICAgICBldiA9IHRoaXMuY2FsY3VsYXRlUmFzdGVyZWRFdmVudFRyaWdnZXJzKHRoaXMuZXZlbnRzKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRFJFVkVSU0U6XHJcbiAgICAgICAgICAgIGV2ID0gdGhpcy5jYWxjdWxhdGVSYXN0ZXJlZEV2ZW50VHJpZ2dlcnModGhpcy5nZXRQcm9jZXNzZWRFdmVudFRyaWdnZXIoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0UpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZXZlbnRzUHJvY2Vzc2VkLnNldChfdHlwZSwgZXYpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLmV2ZW50c1Byb2Nlc3NlZC5nZXQoX3R5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhdmVyc2VzIGFuIGV4aXN0aW5nIHN0cnVjdHVyZSB0byBhcHBseSBhIHJlY2FsY3VsYXRpb24gZnVuY3Rpb24gdG8gdGhlIEFuaW1hdGlvblN0cnVjdHVyZSB0byBzdG9yZSBpbiBhIG5ldyBTdHJ1Y3R1cmUuXHJcbiAgICAgKiBAcGFyYW0gX29sZFN0cnVjdHVyZSBUaGUgb2xkIHN0cnVjdHVyZSB0byB0cmF2ZXJzZVxyXG4gICAgICogQHBhcmFtIF9mdW5jdGlvblRvVXNlIFRoZSBmdW5jdGlvbiB0byB1c2UgdG8gcmVjYWxjdWxhdGVkIHRoZSBzdHJ1Y3R1cmUuXHJcbiAgICAgKiBAcmV0dXJucyBBIG5ldyBBbmltYXRpb24gU3RydWN0dXJlIHdpdGggdGhlIHJlY2FsdWxhdGVkIEFuaW1hdGlvbiBTZXF1ZW5jZXMuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdHJhdmVyc2VTdHJ1Y3R1cmVGb3JOZXdTdHJ1Y3R1cmUoX29sZFN0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlLCBfZnVuY3Rpb25Ub1VzZTogRnVuY3Rpb24pOiBBbmltYXRpb25TdHJ1Y3R1cmUge1xyXG4gICAgICBsZXQgbmV3U3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbiBpbiBfb2xkU3RydWN0dXJlKSB7XHJcbiAgICAgICAgaWYgKF9vbGRTdHJ1Y3R1cmVbbl0gaW5zdGFuY2VvZiBBbmltYXRpb25TZXF1ZW5jZSkge1xyXG4gICAgICAgICAgbmV3U3RydWN0dXJlW25dID0gX2Z1bmN0aW9uVG9Vc2UoX29sZFN0cnVjdHVyZVtuXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld1N0cnVjdHVyZVtuXSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JOZXdTdHJ1Y3R1cmUoPEFuaW1hdGlvblN0cnVjdHVyZT5fb2xkU3RydWN0dXJlW25dLCBfZnVuY3Rpb25Ub1VzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXdTdHJ1Y3R1cmU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgcmV2ZXJzZWQgQW5pbWF0aW9uIFNlcXVlbmNlIG91dCBvZiBhIGdpdmVuIFNlcXVlbmNlLlxyXG4gICAgICogQHBhcmFtIF9zZXF1ZW5jZSBUaGUgc2VxdWVuY2UgdG8gY2FsY3VsYXRlIHRoZSBuZXcgc2VxdWVuY2Ugb3V0IG9mXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgcmV2ZXJzZWQgU2VxdWVuY2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVSZXZlcnNlU2VxdWVuY2UoX3NlcXVlbmNlOiBBbmltYXRpb25TZXF1ZW5jZSk6IEFuaW1hdGlvblNlcXVlbmNlIHtcclxuICAgICAgbGV0IHNlcTogQW5pbWF0aW9uU2VxdWVuY2UgPSBuZXcgQW5pbWF0aW9uU2VxdWVuY2UoKTtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IF9zZXF1ZW5jZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBvbGRLZXk6IEFuaW1hdGlvbktleSA9IF9zZXF1ZW5jZS5nZXRLZXkoaSk7XHJcbiAgICAgICAgbGV0IGtleTogQW5pbWF0aW9uS2V5ID0gbmV3IEFuaW1hdGlvbktleSh0aGlzLnRvdGFsVGltZSAtIG9sZEtleS5UaW1lLCBvbGRLZXkuVmFsdWUsIG9sZEtleS5TbG9wZU91dCwgb2xkS2V5LlNsb3BlSW4sIG9sZEtleS5Db25zdGFudCk7XHJcbiAgICAgICAgc2VxLmFkZEtleShrZXkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzZXE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgcmFzdGVyZWQgW1tBbmltYXRpb25TZXF1ZW5jZV1dIG91dCBvZiBhIGdpdmVuIHNlcXVlbmNlLlxyXG4gICAgICogQHBhcmFtIF9zZXF1ZW5jZSBUaGUgc2VxdWVuY2UgdG8gY2FsY3VsYXRlIHRoZSBuZXcgc2VxdWVuY2Ugb3V0IG9mXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmFzdGVyZWQgc2VxdWVuY2UuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlUmFzdGVyZWRTZXF1ZW5jZShfc2VxdWVuY2U6IEFuaW1hdGlvblNlcXVlbmNlKTogQW5pbWF0aW9uU2VxdWVuY2Uge1xyXG4gICAgICBsZXQgc2VxOiBBbmltYXRpb25TZXF1ZW5jZSA9IG5ldyBBbmltYXRpb25TZXF1ZW5jZSgpO1xyXG4gICAgICBsZXQgZnJhbWVUaW1lOiBudW1iZXIgPSAxMDAwIC8gdGhpcy5mcmFtZXNQZXJTZWNvbmQ7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLnRvdGFsVGltZTsgaSArPSBmcmFtZVRpbWUpIHtcclxuICAgICAgICBsZXQga2V5OiBBbmltYXRpb25LZXkgPSBuZXcgQW5pbWF0aW9uS2V5KGksIF9zZXF1ZW5jZS5ldmFsdWF0ZShpKSwgMCwgMCwgdHJ1ZSk7XHJcbiAgICAgICAgc2VxLmFkZEtleShrZXkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzZXE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJldmVyc2VkIFtbQW5pbWF0aW9uRXZlbnRUcmlnZ2VyXV0gb2JqZWN0IGJhc2VkIG9uIHRoZSBnaXZlbiBvbmUuICBcclxuICAgICAqIEBwYXJhbSBfZXZlbnRzIHRoZSBldmVudCBvYmplY3QgdG8gY2FsY3VsYXRlIHRoZSBuZXcgb25lIG91dCBvZlxyXG4gICAgICogQHJldHVybnMgdGhlIHJldmVyc2VkIGV2ZW50IG9iamVjdFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVJldmVyc2VFdmVudFRyaWdnZXJzKF9ldmVudHM6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlcik6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciB7XHJcbiAgICAgIGxldCBhZTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0ge307XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gX2V2ZW50cykge1xyXG4gICAgICAgIGFlW25hbWVdID0gdGhpcy50b3RhbFRpbWUgLSBfZXZlbnRzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgcmFzdGVyZWQgW1tBbmltYXRpb25FdmVudFRyaWdnZXJdXSBvYmplY3QgYmFzZWQgb24gdGhlIGdpdmVuIG9uZS4gIFxyXG4gICAgICogQHBhcmFtIF9ldmVudHMgdGhlIGV2ZW50IG9iamVjdCB0byBjYWxjdWxhdGUgdGhlIG5ldyBvbmUgb3V0IG9mXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmFzdGVyZWQgZXZlbnQgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlUmFzdGVyZWRFdmVudFRyaWdnZXJzKF9ldmVudHM6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlcik6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciB7XHJcbiAgICAgIGxldCBhZTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0ge307XHJcbiAgICAgIGxldCBmcmFtZVRpbWU6IG51bWJlciA9IDEwMDAgLyB0aGlzLmZyYW1lc1BlclNlY29uZDtcclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiBfZXZlbnRzKSB7XHJcbiAgICAgICAgYWVbbmFtZV0gPSBfZXZlbnRzW25hbWVdIC0gKF9ldmVudHNbbmFtZV0gJSBmcmFtZVRpbWUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3Mgd2hpY2ggZXZlbnRzIGxheSBiZXR3ZWVuIHR3byBnaXZlbiB0aW1lcyBhbmQgcmV0dXJucyB0aGUgbmFtZXMgb2YgdGhlIG9uZXMgdGhhdCBkby5cclxuICAgICAqIEBwYXJhbSBfZXZlbnRUcmlnZ2VycyBUaGUgZXZlbnQgb2JqZWN0IHRvIGNoZWNrIHRoZSBldmVudHMgaW5zaWRlIG9mXHJcbiAgICAgKiBAcGFyYW0gX21pbiB0aGUgbWluaW11bSBvZiB0aGUgcmFuZ2UgdG8gY2hlY2sgYmV0d2VlbiAoaW5jbHVzaXZlKVxyXG4gICAgICogQHBhcmFtIF9tYXggdGhlIG1heGltdW0gb2YgdGhlIHJhbmdlIHRvIGNoZWNrIGJldHdlZW4gKGV4Y2x1c2l2ZSlcclxuICAgICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBuYW1lcyBvZiB0aGUgZXZlbnRzIGluIHRoZSBnaXZlbiByYW5nZS4gXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2hlY2tFdmVudHNCZXR3ZWVuKF9ldmVudFRyaWdnZXJzOiBBbmltYXRpb25FdmVudFRyaWdnZXIsIF9taW46IG51bWJlciwgX21heDogbnVtYmVyKTogc3RyaW5nW10ge1xyXG4gICAgICBsZXQgZXZlbnRzVG9UcmlnZ2VyOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIF9ldmVudFRyaWdnZXJzKSB7XHJcbiAgICAgICAgaWYgKF9taW4gPD0gX2V2ZW50VHJpZ2dlcnNbbmFtZV0gJiYgX2V2ZW50VHJpZ2dlcnNbbmFtZV0gPCBfbWF4KSB7XHJcbiAgICAgICAgICBldmVudHNUb1RyaWdnZXIucHVzaChuYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGV2ZW50c1RvVHJpZ2dlcjtcclxuICAgIH1cclxuICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvU2VyaWFsaXplci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL011dGFibGUudHNcIi8+XHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAvKipcclxuICAgKiBDYWxjdWxhdGVzIHRoZSB2YWx1ZXMgYmV0d2VlbiBbW0FuaW1hdGlvbktleV1dcy5cclxuICAgKiBSZXByZXNlbnRlZCBpbnRlcm5hbGx5IGJ5IGEgY3ViaWMgZnVuY3Rpb24gKGBmKHgpID0gYXjCsyArIGJ4wrIgKyBjeCArIGRgKS4gXHJcbiAgICogT25seSBuZWVkcyB0byBiZSByZWNhbGN1bGF0ZWQgd2hlbiB0aGUga2V5cyBjaGFuZ2UsIHNvIGF0IHJ1bnRpbWUgaXQgc2hvdWxkIG9ubHkgYmUgY2FsY3VsYXRlZCBvbmNlLlxyXG4gICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uRnVuY3Rpb24ge1xyXG4gICAgcHJpdmF0ZSBhOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBiOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBjOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBkOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBrZXlJbjogQW5pbWF0aW9uS2V5O1xyXG4gICAgcHJpdmF0ZSBrZXlPdXQ6IEFuaW1hdGlvbktleTtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IoX2tleUluOiBBbmltYXRpb25LZXksIF9rZXlPdXQ6IEFuaW1hdGlvbktleSA9IG51bGwpIHtcclxuICAgICAgdGhpcy5rZXlJbiA9IF9rZXlJbjtcclxuICAgICAgdGhpcy5rZXlPdXQgPSBfa2V5T3V0O1xyXG4gICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIGF0IHRoZSBnaXZlbiB0aW1lLlxyXG4gICAgICogQHBhcmFtIF90aW1lIHRoZSBwb2ludCBpbiB0aW1lIGF0IHdoaWNoIHRvIGV2YWx1YXRlIHRoZSBmdW5jdGlvbiBpbiBtaWxsaXNlY29uZHMuIFdpbGwgYmUgY29ycmVjdGVkIGZvciBvZmZzZXQgaW50ZXJuYWxseS5cclxuICAgICAqIEByZXR1cm5zIHRoZSB2YWx1ZSBhdCB0aGUgZ2l2ZW4gdGltZVxyXG4gICAgICovXHJcbiAgICBldmFsdWF0ZShfdGltZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgX3RpbWUgLT0gdGhpcy5rZXlJbi5UaW1lO1xyXG4gICAgICBsZXQgdGltZTI6IG51bWJlciA9IF90aW1lICogX3RpbWU7XHJcbiAgICAgIGxldCB0aW1lMzogbnVtYmVyID0gdGltZTIgKiBfdGltZTtcclxuICAgICAgcmV0dXJuIHRoaXMuYSAqIHRpbWUzICsgdGhpcy5iICogdGltZTIgKyB0aGlzLmMgKiBfdGltZSArIHRoaXMuZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc2V0S2V5SW4oX2tleUluOiBBbmltYXRpb25LZXkpIHtcclxuICAgICAgdGhpcy5rZXlJbiA9IF9rZXlJbjtcclxuICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc2V0S2V5T3V0KF9rZXlPdXQ6IEFuaW1hdGlvbktleSkge1xyXG4gICAgICB0aGlzLmtleU91dCA9IF9rZXlPdXQ7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAoUmUtKUNhbGN1bGF0ZXMgdGhlIHBhcmFtZXRlcnMgb2YgdGhlIGN1YmljIGZ1bmN0aW9uLlxyXG4gICAgICogU2VlIGh0dHBzOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMzE3MzQ2OS9jYWxjdWxhdGUtY3ViaWMtZXF1YXRpb24tZnJvbS10d28tcG9pbnRzLWFuZC10d28tc2xvcGVzLXZhcmlhYmx5XHJcbiAgICAgKiBhbmQgaHR0cHM6Ly9qaXJrYWRlbGxvcm8uZ2l0aHViLmlvL0ZVREdFL0RvY3VtZW50YXRpb24vTG9ncy8xOTA0MTBfTm90aXplbl9MU1xyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGUoKTogdm9pZCB7XHJcbiAgICAgIGlmICghdGhpcy5rZXlJbikge1xyXG4gICAgICAgIHRoaXMuZCA9IHRoaXMuYyA9IHRoaXMuYiA9IHRoaXMuYSA9IDA7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gIC